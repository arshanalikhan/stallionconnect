import "server-only";
import { jwtVerify, SignJWT } from "jose";

/** Signed admin session cookie (12 hours), readable only by the server. */
export const SESSION_COOKIE = "sc_admin";
const MAX_AGE = 12 * 3600;

const key = () => {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(secret);
};

export async function createSessionCookie(email: string) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export const clearSessionCookie = () =>
  `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export async function readSession(headers: Headers): Promise<{ email: string } | null> {
  const cookie = headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    const email = String(payload.email ?? "");
    // Still on the allowed list? (Removing someone takes effect immediately.)
    return allowedEmails().includes(email) ? { email } : null;
  } catch {
    return null;
  }
}

/** ADMIN_EMAILS: comma-separated list of people allowed to sign in. */
export const allowedEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const loginConfigured = () =>
  Boolean(
    allowedEmails().length &&
    process.env.ADMIN_PASSWORD &&
    (process.env.ADMIN_SESSION_SECRET ?? "").length >= 32,
  );
