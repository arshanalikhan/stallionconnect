"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  leadStatuses,
  type Application,
  type Enquiry,
  type LeadKind,
  type LeadStatus,
} from "@/lib/db/types";
import { cn } from "@/lib/cn";

const statusStyle: Record<LeadStatus, string> = {
  new: "bg-mint text-brand-green-dark",
  contacted: "bg-[#e6eefc] text-royal",
  closed: "bg-line text-muted",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

const digits = (phone: string) => phone.replace(/[^\d]/g, "");

function Row({ kind, row }: { kind: LeadKind; row: Enquiry | Application }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState(row.note);
  const [error, setError] = useState("");

  async function save(patch: { status?: LeadStatus; note?: string }) {
    setError("");
    const res = await fetch(`/api/admin/${kind}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return setError("Could not save. Please try again.");
    start(() => router.refresh());
  }

  const details: [string, string][] =
    "service" in row
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

  return (
    <li className={cn("rounded-2xl border border-line bg-white p-5", pending && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{row.name}</h3>
          <p className="text-xs text-muted">{fmt(row.createdAt)}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Status</span>
          <select
            value={row.status}
            onChange={(e) => save({ status: e.target.value as LeadStatus })}
            className={cn(
              "rounded-full px-3 py-1.5 font-semibold capitalize",
              statusStyle[row.status],
            )}
          >
            {leadStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <a href={`mailto:${row.email}`} className="font-medium text-navy hover:underline">
          {row.email}
        </a>
        <a href={`tel:${row.phone}`} className="font-medium text-navy hover:underline">
          {row.phone}
        </a>
        <a
          href={`https://wa.me/${digits(row.phone)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-green hover:underline"
        >
          WhatsApp
        </a>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {details.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{k}</dt>
            <dd className="text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {row.message && (
        <p className="mt-4 rounded-xl bg-surface p-3 text-sm whitespace-pre-line text-ink">
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
          onChange={(e) => setNote(e.target.value)}
          placeholder="Internal note (only visible to admins)"
          maxLength={2000}
          className="flex-1 rounded-xl border border-line px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={note === row.note}
          onClick={() => save({ note })}
          className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Save note
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-[#c0322b]">{error}</p>}
    </li>
  );
}

export function LeadList({ kind, rows }: { kind: LeadKind; rows: (Enquiry | Application)[] }) {
  if (!rows.length) {
    return (
      <p className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-muted">
        Nothing here yet.
      </p>
    );
  }
  return (
    <ul className="mt-6 space-y-4">
      {rows.map((r) => (
        <Row key={r.id} kind={kind} row={r} />
      ))}
    </ul>
  );
}
