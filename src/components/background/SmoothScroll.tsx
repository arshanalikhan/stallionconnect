"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooths mouse-wheel scrolling so the page and the frame background glide
 * together instead of jumping in 100px wheel steps. Touch and keyboard keep
 * native behaviour; reduced-motion visitors get native scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.0,
      smoothWheel: true,
      allowNestedScroll: true,
      anchors: { offset: -80 },
    });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
