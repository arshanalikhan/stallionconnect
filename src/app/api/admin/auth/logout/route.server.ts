import { clearSessionCookie } from "@/lib/admin/session";

/** POST /api/admin/auth/logout: ends the admin session. */
export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": clearSessionCookie(),
    },
  });
}
