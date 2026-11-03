"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { QuoteButton } from "@/components/forms/FormDialogs";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  const listRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });

  // Measure the active link so the pill can glide to it.
  useLayoutEffect(() => {
    const measure = () => {
      const a = listRef.current?.querySelector<HTMLElement>(`[data-nav$="${active}"]`);
      setPill(a ? { left: a.offsetLeft, width: a.offsetWidth } : { left: 0, width: 0 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, scrolled]);

  const solid = scrolled || open;
  /** Frosted, glossy pill used once the page has scrolled. */
  const glass =
    "border-white/80 bg-linear-to-b from-white/85 to-white/60 shadow-[0_12px_40px_-14px_rgb(1_43_117/0.32),inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(1_43_117/0.04)] backdrop-blur-2xl backdrop-saturate-[1.8]";

  return (
    <header
      className={cn(
        "nav-ease pointer-events-none fixed inset-x-0 top-0 z-50 px-3 sm:px-4",
        solid ? "pt-3" : "pt-5",
      )}
    >
      <div
        className={cn(
          "nav-ease pointer-events-auto mx-auto flex items-center justify-between gap-4 rounded-full border",
          solid
            ? cn("max-w-[1120px] py-1.5 pr-1.5 pl-4 sm:pl-5", glass)
            : "max-w-[1280px] border-transparent bg-transparent py-2 pr-2 pl-4 sm:pl-6",
        )}
      >
        <Logo
          priority
          imgClassName={cn("nav-ease w-auto", solid ? "h-10 sm:h-11" : "h-12 sm:h-14")}
        />

        <nav aria-label="Main" className="hidden xl:block">
          <ul ref={listRef} className="relative flex items-center gap-0.5 text-[15px] font-medium">
            {/* Glossy pill that glides to the current section's link */}
            <li
              aria-hidden="true"
              className="nav-ease pointer-events-none absolute top-0 bottom-0 rounded-full bg-linear-to-b from-white to-[#eef3fa] shadow-[0_1px_2px_rgb(16_24_40/0.08),inset_0_1px_0_#fff,0_0_0_1px_rgb(1_43_117/0.06)]"
              style={{ left: pill.left, width: pill.width, opacity: pill.width ? 1 : 0 }}
            />
            {site.nav.map((item) => {
              const isActive = item.href.endsWith(active);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
                    data-nav={item.href}
                    className={cn(
                      "relative block rounded-full px-3.5 py-2 whitespace-nowrap transition-colors duration-300 hover:text-navy",
                      isActive ? "text-navy" : "text-ink/65",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <QuoteButton style={{ size: "sm", className: "nav-ease rounded-full px-5" }} />
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
