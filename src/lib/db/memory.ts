import type { ApplicationInput, EnquiryInput } from "@/lib/forms/schemas";
import type { LeadKind, LeadMap, LeadStore } from "./types";

type Tables = { [K in LeadKind]: LeadMap[K][] };

/**
 * In-memory store for local development only. Data is lost on restart.
 * Kept on globalThis so it survives hot reloads.
 */
const g = globalThis as typeof globalThis & { __scMemoryTables?: Tables };
const tables: Tables = (g.__scMemoryTables ??= { enquiries: [], applications: [] });

const meta = () => ({
  id: crypto.randomUUID(),
  status: "new" as const,
  createdAt: new Date().toISOString(),
  note: "",
});

function withoutConsent<T extends { consent: unknown }>(input: T): Omit<T, "consent"> {
  const copy: Partial<T> = { ...input };
  delete copy.consent;
  return copy as Omit<T, "consent">;
}

export const memoryStore: LeadStore = {
  async createEnquiry(input: EnquiryInput) {
    const row = { ...withoutConsent(input), ...meta() };
    tables.enquiries.unshift(row);
    return { id: row.id };
  },
  async createApplication(input: ApplicationInput) {
    const row = { ...withoutConsent(input), ...meta() };
    tables.applications.unshift(row);
    return { id: row.id };
  },
  async list(kind) {
    return [...tables[kind]] as never;
  },
  async update(kind, id, patch) {
    const row = (tables[kind] as { id: string; status: string; note: string }[]).find(
      (r) => r.id === id,
    );
    if (!row) return false;
    if (patch.status) row.status = patch.status;
    if (patch.note !== undefined) row.note = patch.note;
    return true;
  },
  async remove(kind, id) {
    const rows = tables[kind] as { id: string }[];
    const i = rows.findIndex((r) => r.id === id);
    if (i < 0) return false;
    rows.splice(i, 1);
    return true;
  },
};
