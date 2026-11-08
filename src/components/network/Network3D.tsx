"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { NetState } from "./NetworkScene";

const NetworkScene = dynamic(() => import("./NetworkScene"), { ssr: false });
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** "high", "low", or null (show a still image instead of live 3D). */
function pickQuality(): "high" | "low" | null {
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
  return desktop && cores >= 4 ? "high" : "low";
}

/**
 * Live 3D finance network background (code-built, nothing to download or
 * seek). The camera position is read from page scroll every frame.
 */
export function Network3D() {
  const [quality, setQuality] = useState<"high" | "low" | null | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const state = useRef<NetState>({ page: 0, mx: 0, my: 0 });
  const veil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuality(pickQuality());
    const root = document.documentElement;
    root.dataset.scene = "video";
    return () => {
      delete root.dataset.scene;
    };
  }, []);

  useEffect(() => {
    const s = state.current;
    const read = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      s.page = Math.min(1, Math.max(0, window.scrollY / max));
      if (veil.current)
        veil.current.style.opacity = String(0.12 + 0.15 * Math.sin(s.page * Math.PI));
    };
    const onMouse = (e: PointerEvent) => {
      s.mx = (e.clientX / window.innerWidth) * 2 - 1;
      s.my = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    window.addEventListener("pointermove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
      window.removeEventListener("pointermove", onMouse);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-[#03102b]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${base}/bg/network/060.webp`}
        alt=""
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-700",
          ready ? "opacity-0" : "opacity-100",
        )}
      />
      {quality && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <NetworkScene low={quality === "low"} state={state} onReady={() => setReady(true)} />
        </div>
      )}
      <div ref={veil} className="absolute inset-0 bg-[#03102b]" style={{ opacity: 0.12 }} />
    </div>
  );
}
