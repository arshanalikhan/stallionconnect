"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Quality } from "./HeroScene";

// Three.js is only downloaded when the scene is actually going to be shown.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

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

/**
 * 3D layer behind the hero. The HTML hero renders first; the scene loads when
 * the browser is idle, fades in once it has drawn, and stops rendering while
 * the hero is off screen. Falls back to the plain hero when 3D is unsuitable.
 */
export function Hero3D({ targetId }: { targetId: string }) {
  const [quality, setQuality] = useState<Quality | null>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const progress = useRef(0);

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
    const hero = document.getElementById(targetId);
    if (!hero || !quality) return;

    const onScroll = () => {
      const r = hero.getBoundingClientRect();
      progress.current = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [quality, targetId]);

  useEffect(() => {
    const hero = document.getElementById(targetId);
    if (!hero) return;
    if (ready && quality) hero.dataset.scene = quality;
    else delete hero.dataset.scene;
  }, [ready, quality, targetId]);

  if (!quality) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-1000",
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      <HeroScene
        quality={quality}
        progress={progress}
        active={active}
        onReady={() => setReady(true)}
      />
      {/* keeps the headline readable over the scene */}
      <div className="absolute inset-0 bg-linear-to-b from-white/80 via-white/55 to-white/80 lg:bg-linear-to-r lg:from-white/90 lg:via-white/55 lg:to-transparent" />
    </div>
  );
}
