/**
 * Demo lead store for the static GitHub Pages preview, where there is no server
 * or database. It lives in this browser's localStorage only, starts with sample
 * data, and also records forms and chatbot enquiries sent from the preview so
 * the admin panel can be tried end to end. Never used in production.
 */
import type { Application, Enquiry, LeadKind, LeadMap, LeadStatus } from "@/lib/db/types";
import type { LeadSource } from "@/lib/forms/schemas";

const KEY = "sc-demo-leads-v2";
type Tables = { [K in LeadKind]: LeadMap[K][] };

/** A time `d` days and a few hours in the past (never in the future). */
const daysAgo = (d: number, h = 1) =>
  new Date(Date.now() - d * 86_400_000 - h * 3_600_000).toISOString();

function seed(): Tables {
  const e = (
    n: number,
    v: Omit<Enquiry, "id" | "createdAt" | "note" | "status" | "source"> & {
      status?: LeadStatus;
      source?: LeadSource;
      note?: string;
    },
  ): Enquiry => ({
    id: `demo-e${n}`,
    createdAt: daysAgo(n, 1 + (n % 5)),
    status: v.status ?? "new",
    source: v.source ?? "website",
    note: v.note ?? "",
    ...v,
  });
  const a = (
    n: number,
    v: Omit<Application, "id" | "createdAt" | "note" | "status" | "source"> & {
      status?: LeadStatus;
      source?: LeadSource;
    },
  ): Application => ({
    id: `demo-a${n}`,
    createdAt: daysAgo(n, 2 + (n % 4)),
    status: v.status ?? "new",
    source: v.source ?? "website",
    note: "",
    ...v,
  });
  return {
    enquiries: [
      e(0, {
        name: "Ravi Kumar",
        company: "Acme Bank",
        email: "ravi@acmebank.example",
        phone: "+91 98765 43210",
        service: "Banking & Financial Services",
        teamSize: "11 to 50",
        message:
          "We need 20 agents for credit card sales in Hindi and English, starting next month.",
        source: "chatbot",
      }),
      e(1, {
        name: "Anita Desai",
        company: "ShopKart",
        email: "anita@shopkart.example",
        phone: "+91 99887 76655",
        service: "Support & Lead Generation",
        teamSize: "51 to 200",
        message: "Omnichannel support (chat, email, voice) for our festive season peak.",
      }),
      e(2, {
        name: "James Carter",
        company: "Northwind Telecom",
        email: "james@northwind.example",
        phone: "+44 20 7946 0958",
        service: "Call Centre Operations",
        teamSize: "11 to 50",
        message: "International inbound support for UK customers, 8am to 8pm UK time.",
        status: "contacted",
        note: "Call booked for Thursday 4pm IST.",
      }),
      e(4, {
        name: "Meera Iyer",
        company: "",
        email: "meera.iyer@example.com",
        phone: "+91 90000 12345",
        service: "Back-Office & Admin",
        teamSize: "1 to 10",
        message: "Data entry and document verification for a small NBFC.",
        source: "chatbot",
      }),
      e(6, {
        name: "Farhan Sheikh",
        company: "EduSpark",
        email: "farhan@eduspark.example",
        phone: "+91 91234 56789",
        service: "Inbound & Outbound Sales",
        teamSize: "11 to 50",
        message: "Outbound counselling calls for course admissions.",
        status: "contacted",
      }),
      e(9, {
        name: "Lisa Wong",
        company: "Harbour Insurance",
        email: "lisa@harbour.example",
        phone: "+65 6123 4567",
        service: "BPO & ITES Operations",
        teamSize: "51 to 200",
        message: "Claims processing support, pilot first.",
        status: "closed",
        note: "Signed pilot for 25 seats.",
      }),
      e(13, {
        name: "Arjun Mehta",
        company: "UrbanNest Realty",
        email: "arjun@urbannest.example",
        phone: "+91 98111 22233",
        service: "Inbound & Outbound Sales",
        teamSize: "1 to 10",
        message: "Lead qualification for property enquiries.",
        status: "closed",
      }),
    ],
    applications: [
      a(0, {
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "+91 98765 11111",
        role: "Team Leader",
        experience: "3 to 5 years",
        city: "Pune",
        languages: "English, Hindi, Marathi",
        message: "Can join in 30 days.",
      }),
      a(1, {
        name: "Karan Mehta",
        email: "karan@example.com",
        phone: "+91 91234 22222",
        role: "Customer Support Executive",
        experience: "Fresher",
        city: "Mumbai",
        languages: "English, Hindi",
        message: "",
        source: "chatbot",
      }),
      a(3, {
        name: "Sneha Patil",
        email: "sneha@example.com",
        phone: "+91 99000 33333",
        role: "International Voice Process Associate",
        experience: "1 to 3 years",
        city: "Nagpur",
        languages: "English",
        message: "Worked on a US healthcare process.",
        status: "contacted",
      }),
      a(8, {
        name: "Imran Khan",
        email: "imran@example.com",
        phone: "+91 98222 44444",
        role: "Tele-sales Executive (BFSI)",
        experience: "1 to 3 years",
        city: "Indore",
        languages: "English, Hindi, Urdu",
        message: "",
        status: "closed",
      }),
    ],
  };
}

function read(): Tables {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Tables;
  } catch {
    /* storage blocked: fall through to fresh sample data */
  }
  const fresh = seed();
  write(fresh);
  return fresh;
}

function write(t: Tables) {
  try {
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {
    /* storage blocked: changes last for this page view only */
  }
}

export const demoStore = {
  list<K extends LeadKind>(kind: K): LeadMap[K][] {
    const rows = [...read()[kind]] as LeadMap[K][];
    return rows.sort((x, y) => y.createdAt.localeCompare(x.createdAt));
  },
  update(kind: LeadKind, id: string, patch: { status?: LeadStatus; note?: string }) {
    const t = read();
    const row = (t[kind] as { id: string; status: LeadStatus; note: string }[]).find(
      (r) => r.id === id,
    );
    if (!row) return false;
    Object.assign(row, patch);
    write(t);
    return true;
  },
  remove(kind: LeadKind, id: string) {
    const t = read();
    const before = t[kind].length;
    (t as Record<LeadKind, { id: string }[]>)[kind] = t[kind].filter((r) => r.id !== id);
    write(t);
    return t[kind].length < before;
  },
  /** Records a form or chatbot submission made on the preview site. */
  add(kind: LeadKind, data: Record<string, unknown>) {
    const t = read();
    const row = {
      ...data,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "new",
      note: "",
      source: data.source ?? "website",
    };
    delete (row as Record<string, unknown>).consent;
    (t[kind] as unknown[]).unshift(row);
    write(t);
  },
  reset() {
    write(seed());
  },
};
