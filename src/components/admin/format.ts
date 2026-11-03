import type { LeadStatus } from "@/lib/db/types";

export const statusLabel: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

/** Status chips: colour plus a text label, never colour alone. */
export const statusStyle: Record<LeadStatus, string> = {
  new: "bg-mint text-brand-green-dark ring-brand-green/25",
  contacted: "bg-[#e6eefc] text-royal ring-royal/20",
  closed: "bg-[#eef1f5] text-muted ring-line",
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export const withinDays = (iso: string, days: number) =>
  Date.now() - new Date(iso).getTime() <= days * 86400 * 1000;

export const digits = (phone: string) => phone.replace(/[^\d]/g, "");
