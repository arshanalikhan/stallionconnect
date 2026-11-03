"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logoFull from "@/assets/brand/logo-full.webp";
import { Icon, type IconName } from "@/components/ui/Icon";
import { isDemo } from "@/lib/admin/client";
import { demoStore } from "@/lib/admin/demo";
import { cn } from "@/lib/cn";
import { AdminDataProvider, useAdminData } from "./AdminData";

const nav: { href: string; label: string; icon: IconName; count?: "enquiries" | "applications" }[] =
  [
    { href: "/admin", label: "Dashboard", icon: "monitor" },
    { href: "/admin/enquiries", label: "Enquiries", icon: "chat", count: "enquiries" },
    { href: "/admin/applications", label: "Applications", icon: "people", count: "applications" },
  ];

function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname().replace(/\/$/, "") || "/admin";
  const data = useAdminData();

  if (data.status === "unauthorised") {
    return (
      <main className="grid min-h-svh place-items-center bg-surface p-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-2xl font-bold">Not authorised</h1>
          <p className="mt-2 text-muted">
            Sign in through the company login (Cloudflare Access) to view the admin panel.
          </p>
          <Link href="/" className="mt-6 inline-block font-semibold text-navy underline">
            Back to the website
          </Link>
        </div>
      </main>
    );
  }

  const newCount = (k: "enquiries" | "applications") =>
    data[k].filter((r) => r.status === "new").length;

  return (
    <div className="min-h-svh bg-[#f3f6fb] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="relative border-b border-line bg-white lg:sticky lg:top-0 lg:h-svh lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block lg:px-6 lg:py-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src={logoFull} alt="Stallion Connect" className="h-9 w-auto" priority />
          </Link>
          <span className="rounded-full bg-navy px-2.5 py-1 font-display text-[11px] font-bold tracking-wider text-white lg:mt-3 lg:inline-block">
            ADMIN
          </span>
        </div>
        <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:px-4">
          <ul className="flex gap-1 lg:flex-col">
            {nav.map((n) => {
              const active = path === n.href;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold whitespace-nowrap transition",
                      active
                        ? "bg-navy text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]"
                        : "text-ink/75 hover:bg-surface hover:text-navy",
                    )}
                  >
                    <Icon name={n.icon} className="size-[18px]" />
                    {n.label}
                    {n.count && data.status === "ready" && newCount(n.count) > 0 && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-xs",
                          active ? "bg-white/20" : "bg-mint text-brand-green-dark",
                        )}
                      >
                        {newCount(n.count)} new
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden px-6 py-5 text-sm lg:absolute lg:bottom-0 lg:block lg:w-full">
          <p className="truncate text-muted">{data.admin}</p>
          <div className="mt-2 flex gap-4">
            <Link href="/" className="font-semibold text-navy hover:underline">
              View site
            </Link>
            {!isDemo && (
              <a href="/cdn-cgi/access/logout" className="font-semibold text-navy hover:underline">
                Sign out
              </a>
            )}
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        {isDemo && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f3d48a] bg-[#fff7e0] px-5 py-2.5 text-sm text-[#6b4e00] lg:px-8">
            <p>
              <strong>Preview demo.</strong> Sample data, saved only in this browser. Forms and
              chatbot enquiries you send on the preview also appear here. The real panel goes live
              with Cloudflare.
            </p>
            <button
              type="button"
              onClick={() => {
                demoStore.reset();
                void data.refresh();
              }}
              className="font-semibold underline underline-offset-2"
            >
              Reset demo data
            </button>
          </div>
        )}
        <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-10">
          {data.status === "loading" && <p className="text-muted">Loading...</p>}
          {data.status === "error" && (
            <p role="alert" className="rounded-xl bg-[#fdecea] px-4 py-3 text-[#8a1f17]">
              Could not load the data. Please refresh the page.
            </p>
          )}
          {data.status === "ready" && children}
        </main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminDataProvider>
      <Shell>{children}</Shell>
    </AdminDataProvider>
  );
}
