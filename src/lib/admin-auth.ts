import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { loginConfigured, readSession } from "@/lib/admin/session";

/**
 * Admin access check. Any one of these lets a request through:
 *
 * 1. Password + emailed code sign-in: a valid signed session cookie
 *    (see src/lib/admin/session.ts and /api/admin/auth/*).
 * 2. Cloudflare Access, if configured later: Access adds a signed JWT in the
 *    `Cf-Access-Jwt-Assertion` header, verified here. Needs
 *    CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD.
 * 3. Local development with no sign-in configured: allowed, for testing.
 *
 * Anything else fails closed.
 */
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export async function getAdmin(headers: Headers): Promise<{ email: string } | null> {
  if (loginConfigured()) {
    const session = await readSession(headers);
    if (session) return session;
  }

  const team = process.env.CF_ACCESS_TEAM_DOMAIN;
  const aud = process.env.CF_ACCESS_AUD;

  if (team && aud) {
    const token = headers.get("cf-access-jwt-assertion");
    if (!token) return null;
    jwks ??= createRemoteJWKSet(new URL(`https://${team}/cdn-cgi/access/certs`));
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: `https://${team}`,
        audience: aud,
      });
      return { email: String(payload.email ?? "admin") };
    } catch {
      return null;
    }
  }

  if (process.env.NODE_ENV === "development" && !loginConfigured()) {
    return { email: "dev@localhost" };
  }
  return null;
}
