import { z } from "zod";
import { json, serverError } from "@/lib/api/http";
import { randomCode, safeEqual, sha256 } from "@/lib/admin/crypto";
import { otpStore } from "@/lib/admin/otp-store";
import { allowedEmails, loginConfigured } from "@/lib/admin/session";
import { sendLoginCode } from "@/lib/email";

const body = z.object({
  email: z.string().trim().toLowerCase().max(200),
  password: z.string().max(200),
});

const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 8; // wrong passwords per email per 15 minutes
const MAX_CODES = 5; // codes sent per email per 15 minutes
const CODE_TTL_MS = 10 * 60_000;

/** Masks an email for display: a****@gmail.com */
const mask = (e: string) => e.replace(/^(.)[^@]*/, (_, c: string) => `${c}****`);

/**
 * POST /api/admin/auth/login: step 1 of admin sign-in. Checks email and
 * password, then emails a one-time code. Returns a challenge id for step 2.
 */
export async function POST(request: Request) {
  if (!loginConfigured()) {
    return json({ ok: false, error: "Admin sign-in is not set up yet." }, 503);
  }
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return json({ ok: false, error: "Please enter your email and password." }, 422);
  const { email, password } = parsed.data;

  try {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    if ((await otpStore.countFailures(email, since)) >= MAX_FAILURES) {
      return json({ ok: false, error: "Too many attempts. Please try again in 15 minutes." }, 429);
    }

    const [given, expected] = await Promise.all([
      sha256(password),
      sha256(process.env.ADMIN_PASSWORD ?? ""),
    ]);
    if (!allowedEmails().includes(email) || !safeEqual(given, expected)) {
      await otpStore.logFailure(email);
      return json({ ok: false, error: "Email or password is incorrect." }, 401);
    }

    if ((await otpStore.countSent(email, since)) >= MAX_CODES) {
      return json({ ok: false, error: "Too many codes requested. Please wait 15 minutes." }, 429);
    }

    const id = crypto.randomUUID();
    const code = randomCode();
    await otpStore.create({
      id,
      email,
      codeHash: await sha256(`${id}:${code}:${process.env.ADMIN_SESSION_SECRET}`),
      expiresAt: new Date(Date.now() + CODE_TTL_MS).toISOString(),
      attempts: 0,
    });

    try {
      await sendLoginCode(email, code);
    } catch (err) {
      console.error(err);
      await otpStore.remove(id);
      return json({ ok: false, error: "Could not send the code. Please try again." }, 502);
    }

    void otpStore.cleanup().catch(() => {});
    return json({ ok: true, challenge: id, sentTo: mask(email) });
  } catch (err) {
    return serverError(err);
  }
}
