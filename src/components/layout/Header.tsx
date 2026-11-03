"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { QuoteButton } from "@/components/forms/FormDialogs";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the menu item for the section in the middle of the screen.
  useEffect(() => {
    const ids = site.nav.map((n) => n.href.split("#")[1]).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;
  /** Frosted, glossy pill used once the page has scrolled. */
  const glass =
    "border-white/70 bg-linear-to-b from-white/90 to-white/70 shadow-[0_10px_40px_-14px_rgb(1_43_117/0.3),inset_0_1px_0_rgb(255_255_255/0.9)] backdrop-blur-xl backdrop-saturate-150";

  return (
    <header className="pointer-events-none sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex max-w-[1240px] items-center justify-between gap-4 rounded-full border py-2 pr-2 pl-4 transition-all duration-500 sm:pl-6",
          solid ? glass : "border-transparent bg-transparent",
        )}
      >
        <Logo priority imgClassName="h-11 w-auto sm:h-12" />

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-0.5 text-[15px] font-medium">
            {site.nav.map((item) => {
              const isActive = item.href.endsWith(active);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative block rounded-full px-3.5 py-2 whitespace-nowrap transition-colors hover:text-navy",
                      isActive ? "text-navy" : "text-ink/65",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand-green transition-opacity",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <QuoteButton style={{ size: "sm", className: "rounded-full px-5" }} />
          <button
            type="button"
            className="relative size-11 rounded-full xl:hidden"
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
      </div>

      <nav
        id="mobile-menu"
        aria-label="Mobile"
        hidden={!open}
        className={cn(
          "pointer-events-auto mx-auto mt-2 max-w-[1240px] rounded-3xl border p-2 xl:hidden",
          glass,
        )}
      >
        <ul className="flex flex-col">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-2xl px-4 py-3 font-medium hover:bg-navy/[0.05]",
                  item.href.endsWith(active) ? "text-navy" : "text-ink/75",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
