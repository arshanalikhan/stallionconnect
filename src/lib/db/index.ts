import "server-only";
import { createD1Store, type D1Like } from "./d1";
import { memoryStore } from "./memory";
import type { LeadStore } from "./types";

/**
 * Returns the lead store.
 *
 * - On Cloudflare the D1 binding named `DB` is used (the OpenNext adapter
 *   exposes bindings on a global symbol, read by `getD1`).
 * - In local development an in-memory store is used so forms can be tested
 *   without any cloud setup.
 */
/** The Cloudflare D1 binding `DB`, when running on Cloudflare. */
export function getD1(): D1Like | undefined {
  const ctx = (globalThis as Record<symbol, { env?: { DB?: D1Like } } | undefined>)[
    Symbol.for("__cloudflare-context__")
  ];
  return ctx?.env?.DB;
}

export function getStore(): LeadStore {
  const db = getD1();
  if (db) return createD1Store(db);

  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_MEMORY_STORE === "true") {
    return memoryStore;
  }
  throw new Error("Database binding `DB` is not configured.");
}

export type { D1Like } from "./d1";
export * from "./types";
