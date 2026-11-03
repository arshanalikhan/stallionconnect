import "server-only";
import { getD1 } from "@/lib/db";

/**
 * Storage for admin sign-in codes and failed attempts: D1 on Cloudflare,
 * memory in local development.
 */
type Challenge = {
  id: string;
  email: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
};

type Memory = {
  otps: Map<string, Challenge & { createdAt: string }>;
  failures: { email: string; at: string }[];
};
const g = globalThis as typeof globalThis & { __scOtp?: Memory };
const mem: Memory = (g.__scOtp ??= { otps: new Map(), failures: [] });

const now = () => new Date().toISOString();

export const otpStore = {
  async create(c: Challenge) {
    const db = getD1();
    if (!db) return void mem.otps.set(c.id, { ...c, createdAt: now() });
    await db
      .prepare(
        "INSERT INTO admin_otps (id, email, code_hash, expires_at, attempts, created_at) VALUES (?, ?, ?, ?, 0, ?)",
      )
      .bind(c.id, c.email, c.codeHash, c.expiresAt, now())
      .run();
  },

  async get(id: string): Promise<Challenge | undefined> {
    const db = getD1();
    if (!db) return mem.otps.get(id);
    const { results } = await db
      .prepare("SELECT id, email, code_hash, expires_at, attempts FROM admin_otps WHERE id = ?")
      .bind(id)
      .all<{
        id: string;
        email: string;
        code_hash: string;
        expires_at: string;
        attempts: number;
      }>();
    const r = results[0];
    return (
      r && {
        id: r.id,
        email: r.email,
        codeHash: r.code_hash,
        expiresAt: r.expires_at,
        attempts: r.attempts,
      }
    );
  },

  async bumpAttempts(id: string) {
    const db = getD1();
    if (!db) {
      const c = mem.otps.get(id);
      if (c) c.attempts++;
      return;
    }
    await db.prepare("UPDATE admin_otps SET attempts = attempts + 1 WHERE id = ?").bind(id).run();
  },

  async remove(id: string) {
    const db = getD1();
    if (!db) return void mem.otps.delete(id);
    await db.prepare("DELETE FROM admin_otps WHERE id = ?").bind(id).run();
  },

  /** Codes sent to this email since `since` (for rate limiting). */
  async countSent(email: string, since: string) {
    const db = getD1();
    if (!db)
      return [...mem.otps.values()].filter((c) => c.email === email && c.createdAt >= since).length;
    const { results } = await db
      .prepare("SELECT COUNT(*) AS n FROM admin_otps WHERE email = ? AND created_at >= ?")
      .bind(email, since)
      .all<{ n: number }>();
    return results[0]?.n ?? 0;
  },

  async logFailure(email: string) {
    const db = getD1();
    if (!db) return void mem.failures.push({ email, at: now() });
    await db
      .prepare("INSERT INTO admin_auth_failures (email, created_at) VALUES (?, ?)")
      .bind(email, now())
      .run();
  },

  async countFailures(email: string, since: string) {
    const db = getD1();
    if (!db) return mem.failures.filter((f) => f.email === email && f.at >= since).length;
    const { results } = await db
      .prepare("SELECT COUNT(*) AS n FROM admin_auth_failures WHERE email = ? AND created_at >= ?")
      .bind(email, since)
      .all<{ n: number }>();
    return results[0]?.n ?? 0;
  },

  /** Removes expired codes and old failures so the tables stay small. */
  async cleanup() {
    const db = getD1();
    const cutoff = new Date(Date.now() - 24 * 3600_000).toISOString();
    if (!db) return;
    await db.prepare("DELETE FROM admin_otps WHERE expires_at < ?").bind(now()).run();
    await db.prepare("DELETE FROM admin_auth_failures WHERE created_at < ?").bind(cutoff).run();
  },
};
