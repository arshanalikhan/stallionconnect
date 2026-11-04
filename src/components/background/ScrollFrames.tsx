"use client";

import { useEffect, useRef } from "react";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const COUNT = 240;

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
    const dir = window.matchMedia("(max-width: 767px)").matches ? "frames-m" : "frames";
    const imgs: (ImageBitmap | HTMLImageElement)[] = [];
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
      shown += (target - shown) * (1 - Math.exp(-dt / 70));
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

    // Load first frame, then the rest in order.
    for (let i = 0; i < (reduce ? 1 : COUNT); i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = `${base}/bg/${dir}/${String(i + 1).padStart(3, "0")}.webp`;
      img.onload = async () => {
        // Decode once up front so drawing never stalls on a decode.
        try {
          if ("createImageBitmap" in window) imgs[i] = await createImageBitmap(img);
          else await img.decode();
        } catch {}
        loaded[i] = true;
        if (dirty || Math.abs(i - shown) < 2) {
          dirty = true;
          kick();
        }
      };
      imgs.push(img);
    }

    resize();
    shown = reduce ? 0 : progress() * (COUNT - 1);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      imgs.forEach((im) => {
        if (im instanceof HTMLImageElement) im.onload = null;
        else im.close();
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
