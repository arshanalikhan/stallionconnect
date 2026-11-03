import { z } from "zod";
import { json, serverError } from "@/lib/api/http";
import { safeEqual, sha256 } from "@/lib/admin/crypto";
import { otpStore } from "@/lib/admin/otp-store";
import { createSessionCookie, loginConfigured } from "@/lib/admin/session";

const body = z.object({
  challenge: z.string().max(100),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
});

const MAX_ATTEMPTS = 5;

/** POST /api/admin/auth/verify: step 2 of admin sign-in. Checks the emailed code. */
export async function POST(request: Request) {
  if (!loginConfigured()) {
    return json({ ok: false, error: "Admin sign-in is not set up yet." }, 503);
  }
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: "Please enter the 6-digit code." }, 422);
  const { challenge, code } = parsed.data;

  try {
    const c = await otpStore.get(challenge);
    if (!c || c.expiresAt < new Date().toISOString()) {
      if (c) await otpStore.remove(c.id);
      return json(
        { ok: false, expired: true, error: "This code has expired. Please sign in again." },
        400,
      );
    }
    if (c.attempts >= MAX_ATTEMPTS) {
      await otpStore.remove(c.id);
      return json(
        { ok: false, expired: true, error: "Too many wrong codes. Please sign in again." },
        429,
      );
    }

    const hash = await sha256(`${c.id}:${code}:${process.env.ADMIN_SESSION_SECRET}`);
    if (!safeEqual(hash, c.codeHash)) {
      const left = MAX_ATTEMPTS - c.attempts - 1;
      await otpStore.bumpAttempts(c.id);
      return json(
        {
          ok: false,
          error:
            left > 0 ? `Wrong code. ${left} ${left === 1 ? "try" : "tries"} left.` : "Wrong code.",
        },
        401,
      );
    }

    await otpStore.remove(c.id);
    return new Response(JSON.stringify({ ok: true, email: c.email }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Set-Cookie": await createSessionCookie(c.email),
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
