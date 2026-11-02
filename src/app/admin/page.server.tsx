import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import logoFull from "@/assets/brand/logo-full.webp";
import { LeadList } from "@/components/admin/LeadList";
import { getAdmin } from "@/lib/admin-auth";
import { getStore, isLeadKind, isLeadStatus, leadStatuses, type LeadKind } from "@/lib/db";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const tabs: { kind: LeadKind; label: string }[] = [
  { kind: "enquiries", label: "Quote enquiries" },
  { kind: "applications", label: "Job applications" },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await getAdmin(await headers());
  if (!admin) {
    return (
      <main className="grid min-h-svh place-items-center bg-surface p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Not authorised</h1>
          <p className="mt-2 text-muted">Sign in through the company login to view this page.</p>
        </div>
      </main>
    );
  }

  const sp = await searchParams;
  const kind: LeadKind = isLeadKind(sp.tab) ? sp.tab : "enquiries";
  const status = isLeadStatus(sp.status) ? sp.status : undefined;

  const store = getStore();
  const [rows, counts] = await Promise.all([store.list(kind, { status }), store.counts()]);
  const total = (k: LeadKind) => leadStatuses.reduce((n, s) => n + counts[k][s], 0);
  const href = (t: LeadKind, s?: string) => `/admin?tab=${t}${s ? `&status=${s}` : ""}`;

  return (
    <div className="min-h-svh bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src={logoFull} alt="Stallion Connect" className="h-10 w-auto" priority />
            <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold tracking-wider text-white">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:inline">{admin.email}</span>
            <Link href="/" className="font-semibold text-navy hover:underline">
              View site
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <nav aria-label="Lead type" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.kind}
              href={href(t.kind)}
              aria-current={t.kind === kind ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition",
                t.kind === kind ? "bg-navy text-white" : "bg-white text-navy hover:bg-line",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  t.kind === kind ? "bg-white/20" : "bg-mint text-brand-green-dark",
                )}
              >
                {counts[t.kind].new} new
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-sm">
            {[undefined, ...leadStatuses].map((s) => (
              <Link
                key={s ?? "all"}
                href={href(kind, s)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 font-medium capitalize",
                  s === status
                    ? "border-brand-green bg-brand-green text-white"
                    : "border-line bg-white text-ink hover:border-navy",
                )}
              >
                {s ?? "All"} ({s ? counts[kind][s] : total(kind)})
              </Link>
            ))}
          </div>
          <a
            href={`/api/admin/${kind}/export`}
            className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-navy"
          >
            Download CSV
          </a>
        </div>

        <LeadList kind={kind} rows={rows} />
      </main>
    </div>
  );
}
