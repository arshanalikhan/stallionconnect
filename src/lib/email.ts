import "server-only";

/**
 * Sends the admin sign-in code by email through Resend (free tier).
 * Needs RESEND_API_KEY and EMAIL_FROM (for example
 * "Stallion Connect <no-reply@stallionconnect.in>", or
 * "Stallion Connect <onboarding@resend.dev>" before the domain is verified).
 * In local development without a key, the code is printed to the server log.
 */
export async function sendLoginCode(to: string, code: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Stallion Connect <onboarding@resend.dev>";

  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[dev] Admin sign-in code for ${to}: ${code}`);
      return;
    }
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Your Stallion Connect admin code: ${code}`,
      text: `Your sign-in code is ${code}. It expires in 10 minutes. If you did not try to sign in, change the admin password.`,
      html: `<div style="font-family:Georgia,'Times New Roman',serif;max-width:480px;margin:auto;padding:24px;color:#0b1526">
  <p style="color:#139528;letter-spacing:.15em;font-size:12px;font-weight:bold;margin:0">STALLION CONNECT ADMIN</p>
  <h1 style="color:#012b75;font-size:22px;margin:12px 0">Your sign-in code</h1>
  <p style="font-size:34px;letter-spacing:.3em;font-weight:bold;color:#012b75;background:#eef3fb;border-radius:12px;padding:16px;text-align:center;margin:16px 0">${code}</p>
  <p style="color:#4b5b6b;font-size:14px">It expires in 10 minutes. If you did not try to sign in, change the admin password.</p>
</div>`,
    }),
  });
  if (!res.ok) throw new Error(`Email service error ${res.status}: ${await res.text()}`);
}
