"use client";

import { useEffect, useMemo, useState } from "react";
import { adminClient } from "@/lib/admin/client";
import {
  leadStatuses,
  type Application,
  type Enquiry,
  type LeadKind,
  type LeadStatus,
} from "@/lib/db/types";
import { cn } from "@/lib/cn";
import { useAdminData } from "./AdminData";
import { digits, fmtDate, statusLabel, statusStyle, timeAgo } from "./format";

type Row = Enquiry | Application;

const copy = {
  enquiries: {
    title: "Enquiries",
    intro: "Quote requests from the website form and the chatbot.",
    empty: "No enquiries yet.",
  },
  applications: {
    title: "Applications",
    intro: "Job applications. CVs arrive separately by email.",
    empty: "No applications yet.",
  },
} as const;

function details(row: Row): [string, string][] {
  return "service" in row
    ? [
        ["Company", row.company || "-"],
        ["Service", row.service],
        ["Team size", row.teamSize],
      ]
    : [
        ["Role", row.role],
        ["Experience", row.experience],
        ["City", row.city || "-"],
        ["Languages", row.languages || "-"],
      ];
}

function LeadCard({
  kind,
  row,
  open,
  onToggle,
}: {
  kind: LeadKind;
  row: Row;
  open: boolean;
  onToggle: () => void;
}) {
  const { update, remove } = useAdminData();
  const [note, setNote] = useState(row.note);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setError("");
    try {
      await fn();
    } catch {
      setError("Could not save. Please try again.");
    }
  };

  const summary =
    "service" in row
      ? `${row.company ? `${row.company} · ` : ""}${row.service}`
      : `${row.role} · ${row.experience}`;

  return (
    <li
      id={row.id}
      className={cn(
        "gloss scroll-mt-24 rounded-card border bg-white shadow-soft transition",
        open ? "border-navy/25" : "border-line/80",
      )}
    >
      <div className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap sm:px-5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            aria-hidden="true"
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full font-display font-bold",
              kind === "enquiries" ? "bg-navy text-white" : "bg-mint text-brand-green-dark",
            )}
          >
            {row.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate font-semibold text-ink">{row.name}</span>
              {row.source === "chatbot" && (
                <span className="rounded-full bg-[#eef3fb] px-2 py-0.5 text-[11px] font-semibold text-royal">
                  Chatbot
                </span>
              )}
            </span>
            <span className="block truncate text-sm text-muted">{summary}</span>
          </span>
        </button>
        <span className="text-xs whitespace-nowrap text-muted" title={fmtDate(row.createdAt)}>
          {timeAgo(row.createdAt)}
        </span>
        <label className="shrink-0">
          <span className="sr-only">Status for {row.name}</span>
          <select
            value={row.status}
            onChange={(e) =>
              run(() => update(kind, row.id, { status: e.target.value as LeadStatus }))
            }
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold ring-1",
              statusStyle[row.status],
            )}
          >
            {leadStatuses.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {open && (
        <div className="border-t border-line/70 px-4 pt-4 pb-5 sm:px-5">
          <div className="flex flex-wrap gap-2 text-sm">
            <a
              href={`mailto:${row.email}`}
              className="rounded-lg bg-surface px-3 py-1.5 font-medium text-navy hover:bg-line"
            >
              {row.email}
            </a>
            <a
              href={`tel:${row.phone}`}
              className="rounded-lg bg-surface px-3 py-1.5 font-medium text-navy hover:bg-line"
            >
              {row.phone}
            </a>
            <a
              href={`https://wa.me/${digits(row.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-mint px-3 py-1.5 font-medium text-brand-green-dark hover:bg-[#d6f0df]"
            >
              WhatsApp
            </a>
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {[...details(row), ["Received", fmtDate(row.createdAt)] as [string, string]].map(
              ([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ),
            )}
          </dl>

          {row.message && (
            <p className="mt-4 rounded-xl bg-surface p-3.5 text-sm whitespace-pre-line text-ink">
              {row.message}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor={`note-${row.id}`}>
              Internal note
            </label>
            <input
              id={`note-${row.id}`}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setSaved(false);
              }}
              placeholder="Internal note, only visible to admins"
              maxLength={2000}
              className="flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={note === row.note}
              onClick={() =>
                run(async () => {
                  await update(kind, row.id, { note });
                  setSaved(true);
                })
              }
              className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {saved && note === row.note ? "Saved" : "Save note"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete ${row.name}? This cannot be undone.`))
                  void run(() => remove(kind, row.id));
              }}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-[#b42318] hover:bg-[#fdecea]"
            >
              Delete
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-[#b42318]">{error}</p>}
        </div>
      )}
    </li>
  );
}

const chip = (active: boolean) =>
  cn(
    "rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition",
    active ? "bg-navy text-white ring-navy" : "bg-white text-ink/80 ring-line hover:ring-navy/40",
  );

export function LeadsView({ kind }: { kind: LeadKind }) {
  const data = useAdminData();
  const rows: Row[] = data[kind];
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [source, setSource] = useState<"all" | "website" | "chatbot">("all");
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  const [openId, setOpenId] = useState<string | null>(null);

  // Opening a lead from the dashboard: /admin/enquiries#<id>
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenId(id);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (source === "all" || r.source === source) &&
        (!needle || Object.values(r).some((v) => String(v).toLowerCase().includes(needle))),
    );
    return order === "newest" ? list : [...list].reverse();
  }, [rows, q, status, source, order]);

  const c = copy[kind];
  const count = (s: LeadStatus | "all") =>
    s === "all" ? rows.length : rows.filter((r) => r.status === s).length;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{c.title}</h1>
          <p className="mt-1 text-muted">{c.intro}</p>
        </div>
        <button
          type="button"
          onClick={() => adminClient.download(kind, filtered)}
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-[inset_0_1px_0_#fff] hover:border-navy"
        >
          Download CSV ({filtered.length})
        </button>
      </header>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone, company, message..."
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm"
          />
        </label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as typeof source)}
          aria-label="Source"
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All sources</option>
          <option value="website">Website form</option>
          <option value="chatbot">Chatbot</option>
        </select>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as typeof order)}
          aria-label="Sort"
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {(["all", ...leadStatuses] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={status === s}
            onClick={() => setStatus(s)}
            className={chip(status === s)}
          >
            {s === "all" ? "All" : statusLabel[s]} ({count(s)})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-white p-10 text-center text-muted">
          {rows.length ? "Nothing matches these filters." : c.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <LeadCard
              key={r.id}
              kind={kind}
              row={r}
              open={openId === r.id}
              onToggle={() => setOpenId(openId === r.id ? null : r.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
