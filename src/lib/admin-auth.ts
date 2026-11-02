import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Admin access check.
 *
 * Production: /admin sits behind Cloudflare Access. Access adds a signed JWT in
 * the `Cf-Access-Jwt-Assertion` header; we verify it here so the admin cannot be
 * reached by bypassing Access (for example through the workers.dev URL).
 * Needs CF_ACCESS_TEAM_DOMAIN (e.g. "stallion.cloudflareaccess.com") and
 * CF_ACCESS_AUD (the Access application's audience tag).
 *
 * Development: allowed without login so the panel can be tested locally.
 * Anything else fails closed.
 */
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export async function getAdmin(headers: Headers): Promise<{ email: string } | null> {
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

  if (process.env.NODE_ENV === "development") return { email: "dev@localhost" };
  return null;
}
