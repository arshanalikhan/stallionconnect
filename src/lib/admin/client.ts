/**
 * Admin data access from the browser. Production and local dev use the admin
 * API (protected by Cloudflare Access); the static preview uses the demo store.
 */
import { csvFilename, toCsv } from "@/lib/csv";
import type { LeadKind, LeadMap, LeadStatus } from "@/lib/db/types";
import { isStaticPreview } from "@/lib/forms/submit";
import { demoStore } from "./demo";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const isDemo = isStaticPreview;

export class AuthError extends Error {}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}/api/admin/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (res.status === 401) throw new AuthError("Not authorised");
  const body = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
  if (!res.ok || body.ok === false) throw new Error(body.error ?? "Request failed");
  return body;
}

export const adminClient = {
  async list<K extends LeadKind>(kind: K): Promise<{ rows: LeadMap[K][]; admin: string }> {
    if (isDemo) return { rows: demoStore.list(kind), admin: "demo@preview" };
    return api(kind);
  },
  async update(kind: LeadKind, id: string, patch: { status?: LeadStatus; note?: string }) {
    if (isDemo) return void demoStore.update(kind, id, patch);
    await api(`${kind}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
  async remove(kind: LeadKind, id: string) {
    if (isDemo) return void demoStore.remove(kind, id);
    await api(`${kind}/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  /** Downloads the given rows (already filtered on screen) as a CSV file. */
  download(kind: LeadKind, rows: object[]) {
    const blob = new Blob([toCsv(rows as Record<string, unknown>[])], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = csvFilename(kind);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};
