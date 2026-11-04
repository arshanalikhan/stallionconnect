"use client";

import { useEffect, useRef } from "react";
import { FRAME_SET } from "@/config/site";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const COUNT = 240;
// folder pairs in public/bg: [desktop, phone]
const SETS = {
  network: ["network", "network-m"],
  journey: ["frames", "frames-m"],
} as const;

/**
 * Scroll-driven background built from still frames drawn on a canvas.
 * Smoother than seeking a <video>: every frame is preloaded, and between two
 * frames it shows one whole frame (no blending), so nothing ever doubles.
 * Frames live in public/bg/frames (desktop) and public/bg/frames-m (phones).
 */
export function ScrollFrames() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const veil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.scene = "video";
    return () => {
      delete root.dataset.scene;
    };
  }, []);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dir = SETS[FRAME_SET][window.matchMedia("(max-width: 767px)").matches ? 1 : 0];
    const imgs: (ImageBitmap | HTMLImageElement)[] = new Array(COUNT);
    const loaded: boolean[] = new Array(COUNT).fill(false);
    let shown = 0;
    let raf = 0;
    let dirty = true;
    let lastT = 0;

    const progress = () => {
      const max = Math.max(1, root().scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    };
    function root() {
      return document.documentElement;
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      c.width = Math.round(window.innerWidth * dpr);
      c.height = Math.round(window.innerHeight * dpr);
      dirty = true;
      kick();
    };

    // object-fit: cover
    const cover = (img: ImageBitmap | HTMLImageElement, alpha: number) => {
      const iw = img.width;
      const ih = img.height;
      const s = Math.max(c.width / iw, c.height / ih);
      const w = iw * s;
      const h = ih * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
    };
    // nearest loaded frame at or before i, so early scrolls never go blank
    const nearest = (i: number) => {
      for (let k = i; k >= 0; k--) if (loaded[k]) return k;
      for (let k = i; k < COUNT; k++) if (loaded[k]) return k;
      return -1;
    };

    // Always one whole frame: no cross-fade, so moving text never doubles.
    let drawn = -1;
    const draw = (pos: number) => {
      const a = nearest(Math.round(pos));
      if (a < 0 || (a === drawn && !dirty)) return;
      ctx.globalAlpha = 1;
      cover(imgs[a], 1);
      drawn = a;
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = lastT ? Math.min(64, now - lastT) : 16;
      lastT = now;
      const p = progress();
      const target = reduce ? 0 : p * (COUNT - 1);
      // frame-rate independent easing (~same feel at 60Hz and 120Hz)
      shown += (target - shown) * (1 - Math.exp(-dt / 35));
      if (Math.abs(target - shown) < 0.005) shown = target;
      draw(shown);
      dirty = false;
      if (veil.current) veil.current.style.opacity = String(0.35 + 0.25 * Math.sin(p * Math.PI));
      if (shown !== target) raf = requestAnimationFrame(tick);
      else lastT = 0;
    };
    function kick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    // Coarse to fine: every 16th frame first, then 8th, 4th, 2nd, all.
    // The whole scroll range gets usable frames within the first few
    // requests, and the gaps fill in afterwards.
    const order: number[] = [];
    const seen = new Set<number>();
    for (const step of [16, 8, 4, 2, 1])
      for (let i = 0; i < COUNT; i += step)
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
    if (!seen.has(COUNT - 1)) order.splice(1, 0, COUNT - 1);
    let alive = true;
    let next = 0;
    const loadOne = async (): Promise<void> => {
      while (alive && next < (reduce ? 1 : order.length)) {
        const i = order[next++];
        const url = `${base}/bg/${dir}/${String(i + 1).padStart(3, "0")}.webp`;
        try {
          if ("createImageBitmap" in window) {
            // fetch + createImageBitmap(blob) decodes and scales off the
            // main thread, so loading never stutters the scroll.
            const blob = await (await fetch(url)).blob();
            const probe = await createImageBitmap(blob);
            const s = Math.min(1, fitWH(probe.width, probe.height));
            imgs[i] =
              s < 0.98
                ? await createImageBitmap(probe, {
                    resizeWidth: Math.round(probe.width * s),
                    resizeHeight: Math.round(probe.height * s),
                    resizeQuality: "high",
                  })
                : probe;
            if (imgs[i] !== probe) probe.close();
          } else {
            const img = new Image();
            img.src = url;
            await img.decode();
            imgs[i] = img;
          }
        } catch {
          continue;
        }
        if (!alive) return;
        loaded[i] = true;
        // Redraw if this frame is now the best match for where we are.
        if (nearest(Math.round(shown)) === i) {
          dirty = true;
          kick();
        }
      }
    };
    const fitWH = (w: number, h: number) => Math.max(c.width / w, c.height / h);

    resize();
    for (let k = 0; k < 6; k++) void loadOne();
    shown = reduce ? 0 : progress() * (COUNT - 1);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      alive = false;
      imgs.forEach((im) => {
        if (im && !(im instanceof HTMLImageElement)) im.close();
      });
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-navy-deep">
      <canvas ref={canvas} className="absolute inset-0 size-full" />
      {/* keeps text readable over the footage */}
      <div ref={veil} className="absolute inset-0 bg-navy-deep" style={{ opacity: 0.35 }} />
    </div>
  );
}
