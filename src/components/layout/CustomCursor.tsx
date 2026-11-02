"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = 'a, button, summary, label, select, [role="button"], [data-cursor="hover"]';
const TEXT = 'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

/* ---------- glossy 3D-style artwork (original, brand colours) ---------- */

const ARROW = "M10 6 L10 46 L20 37 L27 54 L35 50.5 L28 34 L42 33 Z";

function Arrow() {
  return (
    <svg viewBox="0 0 64 64" className="cursor-arrow" aria-hidden="true">
      <defs>
        <linearGradient id="cc-arrow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6af59b" />
          <stop offset="0.45" stopColor="#22b24a" />
          <stop offset="1" stopColor="#0f8028" />
        </linearGradient>
        <filter id="cc-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="1.5" dy="3" stdDeviation="2" floodColor="#012b75" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#cc-shadow)" strokeLinejoin="round">
        {/* thickness */}
        <path
          d={ARROW}
          transform="translate(2 3)"
          fill="#0a5c1c"
          stroke="#0a5c1c"
          strokeWidth="7"
        />
        {/* face */}
        <path d={ARROW} fill="url(#cc-arrow)" stroke="url(#cc-arrow)" strokeWidth="7" />
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

/** Pointing hand (index finger up), drawn back to front: palm, curled fingers, index, thumb. */
function HandShapes(props: React.SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      <rect x="14" y="27" width="34" height="30" rx="12" />
      <rect x="27" y="44" width="20" height="9" rx="4.5" />
      <rect x="27" y="36" width="22" height="9" rx="4.5" />
      <rect x="27" y="28" width="23" height="9" rx="4.5" />
      <rect x="16" y="4" width="12" height="33" rx="6" />
      <rect x="11" y="40" width="22" height="10" rx="5" transform="rotate(-18 22 45)" />
    </g>
  );
}

function Hand() {
  return (
    <svg viewBox="0 0 64 64" className="cursor-hand" aria-hidden="true">
      <defs>
        <linearGradient id="cc-hand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7fb0ff" />
          <stop offset="0.45" stopColor="#2a63d4" />
          <stop offset="1" stopColor="#0d3a8f" />
        </linearGradient>
      </defs>
      <g filter="url(#cc-shadow)">
        <HandShapes transform="translate(2 3)" fill="#012b75" />
        <HandShapes fill="url(#cc-hand)" stroke="#012b75" strokeOpacity="0.35" strokeWidth="1.2" />
        <path
          d="M19.5 10 L19.5 27"
          stroke="#fff"
          strokeOpacity="0.65"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M31 31 L44 31"
          stroke="#fff"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="21" cy="7.5" rx="1.8" ry="1.3" fill="#fff" fillOpacity="0.8" />
      </g>
    </svg>
  );
}

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
 * Brand cursor in a glossy 3D toy style: a green arrow that becomes a blue
 * pointing hand over anything clickable, with a spark burst on click.
 * Follows the mouse exactly and tilts slightly with movement.
 * Desktop mouse only; the normal cursor stays for touch, reduced motion,
 * text fields and open dialogs.
 */
export function CustomCursor() {
  const root = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const sparks = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const html = document.documentElement;
    const el = root.current!;
    const t = tilt.current!;
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
      el.dataset.mode = target?.closest(INTERACTIVE) ? "hand" : "arrow";
    };

    const loop = () => {
      // Lean into horizontal movement, then settle back upright.
      const vx = x - lastX;
      lastX = x;
      const target = Math.max(-14, Math.min(14, vx * 0.9));
      angle += (target - angle) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      t.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      raf = Math.abs(angle) > 0.05 || vx !== 0 ? requestAnimationFrame(loop) : 0;
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
      el.dataset.hidden = "true";
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
      <div ref={root} className="cursor" data-hidden="true" data-mode="arrow">
        <div ref={tilt} className="cursor-tilt">
          <div className="cursor-press">
            <Arrow />
            <Hand />
          </div>
        </div>
      </div>
    </div>
  );
}
