import type { ApplicationInput, EnquiryInput } from "@/lib/forms/schemas";
import { leadKinds, leadStatuses, type LeadKind, type LeadMap, type LeadStore } from "./types";

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
  async list(kind, opts) {
    const rows = tables[kind] as LeadMap[typeof kind][];
    return opts?.status ? rows.filter((r) => r.status === opts.status) : [...rows];
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
  async counts() {
    const out = {} as Awaited<ReturnType<LeadStore["counts"]>>;
    for (const k of leadKinds) {
      out[k] = Object.fromEntries(leadStatuses.map((s) => [s, 0])) as Record<
        (typeof leadStatuses)[number],
        number
      >;
      for (const r of tables[k]) out[k][r.status]++;
    }
    return out;
  },
};
