"use client";

import Link from "next/link";
import { adminClient } from "@/lib/admin/client";
import { leadStatuses, type Application, type Enquiry } from "@/lib/db/types";
import { cn } from "@/lib/cn";
import { useAdminData } from "./AdminData";
import { statusLabel, statusStyle, timeAgo, withinDays } from "./format";

function Tile({ value, label, hint }: { value: number; label: string; hint: string }) {
  return (
    <div className="gloss rounded-card border border-line/80 bg-white p-5 shadow-soft">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 font-display text-4xl font-bold text-navy">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

/** Labelled bar list: one hue, value shown as text beside each bar. */
function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="text-sm text-muted">Nothing yet.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between gap-3 text-sm">
            <span className="truncate text-ink">{r.label}</span>
            <span className="font-semibold text-navy tabular-nums">{r.value}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-[#eef2f7]" aria-hidden="true">
            <div
              className="h-full rounded-full bg-royal"
              style={{ width: `${(r.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("gloss rounded-card border border-line/80 bg-white p-6 shadow-soft", className)}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const countBy = <T,>(rows: T[], key: (r: T) => string) => {
  const m = new Map<string, number>();
  rows.forEach((r) => m.set(key(r), (m.get(key(r)) ?? 0) + 1));
  return [...m].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};

export function Dashboard() {
  const { enquiries, applications } = useAdminData();
  const all = [
    ...enquiries.map((r) => ({ kind: "enquiries" as const, row: r as Enquiry | Application })),
    ...applications.map((r) => ({
      kind: "applications" as const,
      row: r as Enquiry | Application,
    })),
  ].sort((a, b) => b.row.createdAt.localeCompare(a.row.createdAt));

  const newE = enquiries.filter((r) => r.status === "new").length;
  const newA = applications.filter((r) => r.status === "new").length;
  const week = all.filter((x) => withinDays(x.row.createdAt, 7)).length;
  const chatbot = all.filter((x) => x.row.source === "chatbot").length;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="mt-1 text-muted">
          {newE + newA > 0
            ? `${newE + newA} new ${newE + newA === 1 ? "lead is" : "leads are"} waiting for a reply.`
            : "You are all caught up."}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile value={newE} label="New enquiries" hint={`${enquiries.length} enquiries in total`} />
        <Tile
          value={newA}
          label="New applications"
          hint={`${applications.length} applications in total`}
        />
        <Tile value={week} label="This week" hint="Enquiries and applications, last 7 days" />
        <Tile
          value={chatbot}
          label="From the chatbot"
          hint={`${all.length - chatbot} from website forms`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Latest activity"
          action={
            <Link
              href="/admin/enquiries"
              className="text-sm font-semibold text-navy hover:underline"
            >
              View all
            </Link>
          }
        >
          {all.length === 0 ? (
            <p className="text-sm text-muted">No enquiries or applications yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {all.slice(0, 8).map(({ kind, row }) => (
                <li key={row.id}>
                  <Link
                    href={`/admin/${kind}#${row.id}`}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-surface"
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold",
                        kind === "enquiries"
                          ? "bg-navy text-white"
                          : "bg-mint text-brand-green-dark",
                      )}
                      aria-hidden="true"
                    >
                      {row.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{row.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {kind === "enquiries"
                          ? `Enquiry: ${(row as Enquiry).service}`
                          : `Application: ${(row as Application).role}`}
                        {row.source === "chatbot" && " · via chatbot"}
                      </span>
                    </span>
                    <span className="hidden text-xs whitespace-nowrap text-muted sm:block">
                      {timeAgo(row.createdAt)}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                        statusStyle[row.status],
                      )}
                    >
                      {statusLabel[row.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Pipeline">
            {(["enquiries", "applications"] as const).map((k) => {
              const rows: { status: string }[] = k === "enquiries" ? enquiries : applications;
              return (
                <div key={k} className="mb-5 last:mb-0">
                  <p className="mb-2 text-sm font-semibold text-navy capitalize">{k}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {leadStatuses.map((st) => (
                      <div key={st} className={cn("rounded-xl px-3 py-2 ring-1", statusStyle[st])}>
                        <p className="text-xs font-semibold">{statusLabel[st]}</p>
                        <p className="font-display text-xl font-bold tabular-nums">
                          {rows.filter((r) => r.status === st).length}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </Panel>

          <Panel title="Most requested services">
            <BarList rows={countBy(enquiries, (r) => r.service).slice(0, 5)} />
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Roles applied for">
          <BarList rows={countBy(applications, (r) => r.role).slice(0, 5)} />
        </Panel>
        <Panel title="Quick actions">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => adminClient.download("enquiries", enquiries)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-navy"
            >
              Download enquiries (CSV)
            </button>
            <button
              type="button"
              onClick={() => adminClient.download("applications", applications)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-navy"
            >
              Download applications (CSV)
            </button>
            <Link
              href="/"
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-navy"
            >
              Open the website
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
