"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useFormDialog } from "@/components/forms/FormDialogs";
import { DOCK_AT, initialSceneState, WIDGET, type Quality, type SceneState } from "./sceneState";

// Three.js is only downloaded when the scene is actually going to be shown.
const SiteScene = dynamic(() => import("./SiteScene"), { ssr: false });
const CardWidget = dynamic(() => import("./SiteScene").then((m) => m.CardWidget), { ssr: false });

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** Decides whether this device should get the 3D scene, and at what quality. */
function pickQuality(): Quality | null {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const nav = navigator as Nav;
  if (nav.connection?.saveData) return null;
  try {
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return null;
  } catch {
    return null;
  }
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  if (cores <= 2 || memory < 2) return null;
  const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
  return desktop && cores >= 4 && memory >= 4 ? "high" : "low";
}

/** Fraction of the viewport's middle band covered by an element (0 to 1). */
function centreCoverage(el: Element | null, vh: number) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const top = vh * 0.3;
  const bottom = vh * 0.7;
  const overlap = Math.min(r.bottom, bottom) - Math.max(r.top, top);
  return Math.max(0, overlap) / (bottom - top);
}

/**
 * Full-page 3D background. Sits behind every section, follows page scroll,
 * and loads only after the page itself is ready. Marks <html data-scene> so
 * the page can adapt (glass sections, hiding the flat hero card).
 */
export function Scene3D() {
  const [quality, setQuality] = useState<Quality | null>(null);
  const [ready, setReady] = useState(false);
  const state = useRef<SceneState>(initialSceneState());
  const veil = useRef<HTMLDivElement>(null);
  const [docked, setDocked] = useState(false);
  const { open } = useFormDialog();

  useEffect(() => {
    const start = () => setQuality(pickQuality());
    const idle = (cb: () => void) =>
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(cb, { timeout: 2500 })
        : setTimeout(cb, 1200);
    if (document.readyState === "complete") idle(start);
    else window.addEventListener("load", () => idle(start), { once: true });
  }, []);

  useEffect(() => {
    if (!quality) return;
    const s = state.current;
    const hero = document.getElementById("home");
    const why = document.getElementById("why-us");
    const process = document.getElementById("process");

    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      s.vw = window.innerWidth;
      s.vh = vh;
      s.page = Math.min(1, window.scrollY / max);
      if (hero) {
        const r = hero.getBoundingClientRect();
        s.hero = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      }
      s.night = centreCoverage(why, vh);
      if (process) {
        const top = process.getBoundingClientRect().top + window.scrollY;
        s.gates = [
          Math.max(0, (top - vh * 0.6) / max),
          Math.min(1, (top + process.offsetHeight - vh * 0.4) / max),
        ];
      }
      // No veil over the hero (it has its own readability gradient), none at night.
      setDocked(s.hero >= DOCK_AT);
      if (veil.current)
        veil.current.style.opacity = String(Math.min(1, s.hero * 1.6) * (1 - s.night));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    const onMouse = (e: PointerEvent) => {
      s.mx = (e.clientX / window.innerWidth) * 2 - 1;
      s.my = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pointermove", onMouse, { passive: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", onMouse);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [quality]);

  useEffect(() => {
    const root = document.documentElement;
    if (ready && quality) root.dataset.scene = quality;
    else delete root.dataset.scene;
  }, [ready, quality]);

  if (!quality) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000",
          ready ? "opacity-100" : "opacity-0",
        )}
      >
        <SiteScene quality={quality} state={state} onReady={() => setReady(true)} />
        {/* light veil keeps text readable by day; fades out at night */}
        <div ref={veil} className="absolute inset-0 bg-white/40" />
      </div>

      {/* After the hero, the card lives here and keeps turning with the scroll. */}
      {quality === "high" && ready && (
        <button
          type="button"
          aria-label="Get a quote"
          tabIndex={docked ? 0 : -1}
          onClick={() => open({ type: "quote" })}
          className={cn(
            "fixed z-40 rounded-2xl transition-opacity duration-200",
            docked ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          style={{
            right: WIDGET.right,
            bottom: WIDGET.bottom,
            width: WIDGET.width,
            height: WIDGET.height,
          }}
        >
          <CardWidget state={state} active={docked} />
        </button>
      )}
    </>
  );
}
