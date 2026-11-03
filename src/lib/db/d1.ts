import type { ApplicationInput, EnquiryInput } from "@/lib/forms/schemas";
import type { Application, Enquiry, LeadKind, LeadStore } from "./types";

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
  source: (r.source as Enquiry["source"]) ?? "website",
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
  source: (r.source as Application["source"]) ?? "website",
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
          `INSERT INTO enquiries (id, created_at, status, name, company, email, phone, service, team_size, message, source)
           VALUES (?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          now(),
          i.name,
          i.company,
          i.email,
          i.phone,
          i.service,
          i.teamSize,
          i.message,
          i.source,
        )
        .run();
      return { id };
    },

    async createApplication(i: ApplicationInput) {
      const id = crypto.randomUUID();
      await db
        .prepare(
          `INSERT INTO applications (id, created_at, status, name, email, phone, role, experience, city, languages, message, source)
           VALUES (?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          i.source,
        )
        .run();
      return { id };
    },

    async list(kind) {
      const { results } = await db
        .prepare(`SELECT * FROM ${table[kind]} ORDER BY created_at DESC LIMIT 1000`)
        .all<Row>();
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

    async remove(kind, id) {
      const res = await db.prepare(`DELETE FROM ${table[kind]} WHERE id = ?`).bind(id).run();
      return (res.meta?.changes ?? 0) > 0;
    },
  };
}
