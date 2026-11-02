import type { ApplicationInput, EnquiryInput } from "@/lib/forms/schemas";
import {
  leadKinds,
  leadStatuses,
  type Application,
  type Enquiry,
  type LeadKind,
  type LeadStore,
} from "./types";

/**
 * Minimal shape of the Cloudflare D1 binding we use. Avoids a dependency on
 * @cloudflare/workers-types; the real binding satisfies this interface.
 */
export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ meta?: { changes?: number } }>;
      all<T>(): Promise<{ results: T[] }>;
    };
    all<T>(): Promise<{ results: T[] }>;
  };
}

type Row = Record<string, string>;

const toEnquiry = (r: Row): Enquiry => ({
  id: r.id,
  status: r.status as Enquiry["status"],
  createdAt: r.created_at,
  note: r.note ?? "",
  name: r.name,
  company: r.company ?? "",
  email: r.email,
  phone: r.phone,
  service: r.service as Enquiry["service"],
  teamSize: r.team_size as Enquiry["teamSize"],
  message: r.message,
});

const toApplication = (r: Row): Application => ({
  id: r.id,
  status: r.status as Application["status"],
  createdAt: r.created_at,
  note: r.note ?? "",
  name: r.name,
  email: r.email,
  phone: r.phone,
  role: r.role as Application["role"],
  experience: r.experience as Application["experience"],
  city: r.city ?? "",
  languages: r.languages ?? "",
  message: r.message ?? "",
});

/** Table names come from this fixed map only, never from user input. */
const table: Record<LeadKind, string> = { enquiries: "enquiries", applications: "applications" };

export function createD1Store(db: D1Like): LeadStore {
  const now = () => new Date().toISOString();

  return {
    async createEnquiry(i: EnquiryInput) {
      const id = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO enquiries (id, created_at, status, name, company, email, phone, service, team_size, message)
           VALUES (?, ?, 'new', ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(id, now(), i.name, i.company, i.email, i.phone, i.service, i.teamSize, i.message)
        .run();
      return { id };
    },

    async createApplication(i: ApplicationInput) {
      const id = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO applications (id, created_at, status, name, email, phone, role, experience, city, languages, message)
           VALUES (?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          now(),
          i.name,
          i.email,
          i.phone,
          i.role,
          i.experience,
          i.city,
          i.languages,
          i.message,
        )
        .run();
      return { id };
    },

    async list(kind, opts) {
      const base = `SELECT * FROM ${table[kind]}`;
      const stmt = opts?.status
        ? db
            .prepare(`${base} WHERE status = ? ORDER BY created_at DESC LIMIT 1000`)
            .bind(opts.status)
        : db.prepare(`${base} ORDER BY created_at DESC LIMIT 1000`);
      const { results } = await stmt.all<Row>();
      return (kind === "enquiries" ? results.map(toEnquiry) : results.map(toApplication)) as never;
    },

    async update(kind, id, patch) {
      const sets: string[] = [];
      const values: unknown[] = [];
      if (patch.status) {
        sets.push("status = ?");
        values.push(patch.status);
      }
      if (patch.note !== undefined) {
        sets.push("note = ?");
        values.push(patch.note);
      }
      if (!sets.length) return false;
      const res = await db
        .prepare(`UPDATE ${table[kind]} SET ${sets.join(", ")} WHERE id = ?`)
        .bind(...values, id)
        .run();
      return (res.meta?.changes ?? 0) > 0;
    },

    async counts() {
      const out = {} as Awaited<ReturnType<LeadStore["counts"]>>;
      for (const k of leadKinds) {
        out[k] = Object.fromEntries(leadStatuses.map((s) => [s, 0])) as Record<
          (typeof leadStatuses)[number],
          number
        >;
        const { results } = await db
          .prepare(`SELECT status, COUNT(*) AS n FROM ${table[k]} GROUP BY status`)
          .all<{ status: string; n: number }>();
        for (const r of results) {
          if (r.status in out[k]) out[k][r.status as (typeof leadStatuses)[number]] = r.n;
        }
      }
      return out;
    },
  };
}
