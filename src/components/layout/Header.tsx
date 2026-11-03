"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { QuoteButton } from "@/components/forms/FormDialogs";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-line/70 bg-white/85 py-2 backdrop-blur-xl"
          : "border-b border-transparent bg-white/50 py-3 backdrop-blur-md",
      )}
    >
      <Container className="flex items-center justify-between gap-4">
        <Logo priority />

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1 text-[15px] font-medium text-ink/75">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 whitespace-nowrap transition-colors hover:bg-navy/[0.06] hover:text-navy"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <QuoteButton style={{ size: "sm" }} />
          <button
            type="button"
            className="relative size-11 rounded-lg xl:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={cn(
                "absolute left-2.5 h-0.5 w-6 bg-navy transition-all",
                open ? "top-5 rotate-45" : "top-3.5",
              )}
            />
            <span
              className={cn(
                "absolute top-5 left-2.5 h-0.5 w-6 bg-navy transition-all",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute left-2.5 h-0.5 w-6 bg-navy transition-all",
                open ? "top-5 -rotate-45" : "top-6.5",
              )}
            />
          </button>
        </div>
      </Container>

      <nav
        id="mobile-menu"
        aria-label="Mobile"
        hidden={!open}
        className="border-t border-line bg-white xl:hidden"
      >
        <Container>
          <ul className="flex flex-col py-3">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 font-medium text-ink hover:bg-surface"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </header>
  );
}
