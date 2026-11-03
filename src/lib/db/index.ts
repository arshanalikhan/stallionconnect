import "server-only";
import { createD1Store, type D1Like } from "./d1";
import { memoryStore } from "./memory";
import type { LeadStore } from "./types";

/**
 * Returns the lead store.
 *
 * - On Cloudflare (final phase) the D1 binding named `DB` is used. The OpenNext
 *   adapter exposes bindings on this global symbol; once the adapter is installed
 *   this can be swapped for `getCloudflareContext().env.DB`.
 * - In local development an in-memory store is used so forms can be tested
 *   without any cloud setup.
 */
export function getStore(): LeadStore {
  const ctx = (globalThis as Record<symbol, { env?: { DB?: D1Like } } | undefined>)[
    Symbol.for("__cloudflare-context__")
  ];
  const db = ctx?.env?.DB;
  if (db) return createD1Store(db);

  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_MEMORY_STORE === "true") {
    return memoryStore;
  }
  throw new Error("Database binding `DB` is not configured.");
}

export * from "./types";
