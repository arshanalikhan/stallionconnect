"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = 'a, button, summary, label, select, [role="button"], [data-cursor="hover"]';
const TEXT = 'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

/* ---------- glossy 3D-style artwork (original, brand colours) ---------- */

const ARROW = "M10 6 L10 46 L20 37 L27 54 L35 50.5 L28 34 L42 33 Z";

const PALETTES = {
  green: { light: "#6af59b", mid: "#22b24a", dark: "#0f8028", edge: "#0a5c1c" },
  blue: { light: "#8ec0ff", mid: "#2f74ff", dark: "#1246c4", edge: "#012b75" },
} as const;

function Arrow({ tone }: { tone: keyof typeof PALETTES }) {
  const c = PALETTES[tone];
  const id = `cc-arrow-${tone}`;
  return (
    <svg viewBox="0 0 64 64" className={`cursor-arrow cursor-arrow-${tone}`} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.light} />
          <stop offset="0.45" stopColor={c.mid} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
      </defs>
      <g strokeLinejoin="round">
        {/* thickness */}
        <path d={ARROW} transform="translate(2 3)" fill={c.edge} stroke={c.edge} strokeWidth="7" />
        {/* face */}
        <path d={ARROW} fill={`url(#${id})`} stroke={`url(#${id})`} strokeWidth="7" />
        {/* shine */}
        <path
          d="M12.5 12 L12.5 36"
          stroke="#fff"
          strokeOpacity="0.6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="14" cy="9.5" rx="2.2" ry="1.6" fill="#fff" fillOpacity="0.75" />
      </g>
    </svg>
  );
}

const TRAIL = 9;

/** Spark burst markup, created per click. */
const SPARK = (() => {
  const rays = [-160, -125, -90, -55, -20]
    .map((deg, i) => {
      const a = (deg * Math.PI) / 180;
      const [r1, r2] = [13, 23];
      const c = i % 2 ? "#c7f25a" : "#2bd66b";
      return `<line x1="${40 + Math.cos(a) * r1}" y1="${40 + Math.sin(a) * r1}" x2="${40 + Math.cos(a) * r2}" y2="${40 + Math.sin(a) * r2}" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/>`;
    })
    .join("");
  return `<svg viewBox="0 0 80 80" width="80" height="80">${rays}</svg>`;
})();

/**
 * Brand cursor in a glossy 3D toy style: a green arrow that turns glowing
 * blue over anything clickable, a trail of dots behind it, and a spark burst
 * on click. Follows the mouse exactly and tilts slightly with movement.
 * Desktop mouse only; the normal cursor stays for touch, reduced motion,
 * text fields and open dialogs.
 */
export function CustomCursor() {
  const root = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const sparks = useRef<HTMLDivElement>(null);
  const dots = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const html = document.documentElement;
    const el = root.current!;
    const t = tilt.current!;
    const trail = dots.current!;
    const dotEls = Array.from(trail.children) as HTMLElement[];
    const pts = dotEls.map(() => ({ x: -200, y: -200 }));
    html.classList.add("custom-cursor");

    let x = -200;
    let y = -200;
    let lastX = x;
    let angle = 0;
    let visible = false;
    let raf = 0;

    const setState = (target: Element | null) => {
      const dialogOpen = !!document.querySelector("dialog[open]");
      const overText = !!target?.closest(TEXT);
      html.classList.toggle("custom-cursor", !dialogOpen);
      el.dataset.hidden = String(dialogOpen || overText || !visible);
      el.dataset.hover = String(!!target?.closest(INTERACTIVE));
      trail.dataset.hidden = el.dataset.hidden;
    };

    const loop = () => {
      // Lean into horizontal movement, then settle back upright.
      const vx = x - lastX;
      lastX = x;
      const target = Math.max(-14, Math.min(14, vx * 0.9));
      angle += (target - angle) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      t.style.transform = `rotate(${angle.toFixed(2)}deg)`;

      // Each dot eases towards the one in front of it, forming a trail.
      let lead = { x, y };
      let moving = false;
      pts.forEach((p, i) => {
        p.x += (lead.x - p.x) * 0.42;
        p.y += (lead.y - p.y) * 0.42;
        if (Math.abs(lead.x - p.x) + Math.abs(lead.y - p.y) > 0.2) moving = true;
        dotEls[i].style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        lead = p;
      });

      // Fade the trail out while the mouse is still, so dots do not pile up at the tip.
      trail.dataset.idle = String(!moving);

      raf = Math.abs(angle) > 0.05 || vx !== 0 || moving ? requestAnimationFrame(loop) : 0;
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
        lastX = x;
        pts.forEach((p) => ((p.x = x), (p.y = y)));
      }
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`; // exact, no lag
      setState(e.target as Element);
      kick();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || el.dataset.hidden === "true") return;
      el.dataset.pressed = "true";
      const s = document.createElement("div");
      s.className = "cursor-spark";
      s.innerHTML = SPARK;
      // Burst from the fingertip / arrow tip.
      s.style.left = `${e.clientX}px`;
      s.style.top = `${e.clientY}px`;
      sparks.current?.appendChild(s);
      s.addEventListener("animationend", () => s.remove(), { once: true });
    };
    const onUp = () => (el.dataset.pressed = "false");
    const onLeave = () => {
      visible = false;
      el.dataset.hidden = trail.dataset.hidden = "true";
    };
    const onScroll = () => setState(document.elementFromPoint(x, y));

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    html.addEventListener("mouseleave", onLeave);
    const mo = new MutationObserver(() => setState(document.elementFromPoint(x, y)));
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });

    return () => {
      html.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      html.removeEventListener("mouseleave", onLeave);
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="cursor-layer">
      <div ref={sparks} />
      <div ref={dots} className="cursor-trail" data-hidden="true">
        {Array.from({ length: TRAIL }, (_, i) => (
          <span
            key={i}
            style={
              {
                "--s": `${8 - i * 0.6}px`,
                "--o": `${0.85 - i * 0.08}`,
                "--c": i < TRAIL / 2 ? "var(--color-brand-green-light)" : "#4f8dff",
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div ref={root} className="cursor" data-hidden="true" data-hover="false">
        <div ref={tilt} className="cursor-tilt">
          <div className="cursor-press">
            <Arrow tone="green" />
            <Arrow tone="blue" />
          </div>
        </div>
      </div>
    </div>
  );
}
