"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = 'a, button, summary, label, select, [role="button"], [data-cursor="hover"]';
const TEXT = 'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';
const DARK = '[data-cursor="dark"]';

/**
 * Brand cursor: a green dot that tracks the pointer exactly, a trailing ring
 * that grows over anything clickable, and a "connection ping" on click.
 * Desktop mouse only; the normal cursor stays for touch, reduced motion,
 * text fields and open dialogs.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const pings = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const root = document.documentElement;
    const d = dot.current!;
    const r = ring.current!;
    root.classList.add("custom-cursor");

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let visible = false;
    let raf = 0;

    const setState = (target: Element | null) => {
      const dialogOpen = !!document.querySelector("dialog[open]");
      const overText = !!target?.closest(TEXT);
      const hidden = dialogOpen || overText || !visible;
      root.classList.toggle("custom-cursor", !dialogOpen);
      d.dataset.hidden = r.dataset.hidden = String(hidden);
      r.dataset.hover = String(!!target?.closest(INTERACTIVE));
      d.dataset.dark = r.dataset.dark = String(!!target?.closest(DARK));
    };

    const loop = () => {
      // The ring eases towards the pointer; the dot is exact.
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        rx = x;
        ry = y;
      }
      setState(e.target as Element);
      kick();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || d.dataset.hidden === "true") return;
      r.dataset.pressed = "true";
      const p = document.createElement("span");
      p.className = "cursor-ping";
      p.style.left = `${e.clientX}px`;
      p.style.top = `${e.clientY}px`;
      if (d.dataset.dark === "true") p.dataset.dark = "true";
      pings.current?.appendChild(p);
      p.addEventListener("animationend", () => p.remove(), { once: true });
    };
    const onUp = () => (r.dataset.pressed = "false");
    const onLeave = () => {
      visible = false;
      d.dataset.hidden = r.dataset.hidden = "true";
    };
    // Re-check after scrolling: the element under the pointer may have changed.
    const onScroll = () => setState(document.elementFromPoint(x, y));

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    // Dialogs open and close without the mouse moving, so watch for them too.
    const mo = new MutationObserver(() => setState(document.elementFromPoint(x, y)));
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });

    return () => {
      root.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="cursor-layer">
      <div ref={ring} className="cursor-ring" data-hidden="true" />
      <div ref={dot} className="cursor-dot" data-hidden="true" />
      <div ref={pings} />
    </div>
  );
}
