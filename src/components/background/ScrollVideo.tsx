"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Full-page background video that plays forward and back with the page
 * scroll: top of the page = first frame, bottom = last frame.
 * Testing alternative to the 3D city (switch: BACKGROUND in src/config/site.ts).
 * Reduced-motion visitors get the still poster frame.
 */
export function ScrollVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [still, setStill] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStill(reduce);
    if (reduce) return;
    const small = window.matchMedia("(max-width: 767px)").matches;
    setSrc(`${base}/bg/journey${small ? "-mobile" : ""}`);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.scene = "video";
    return () => {
      delete root.dataset.scene;
    };
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v || !src) return;
    let target = 0;
    let shown = 0;
    let raf = 0;

    const progress = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    };
    // Ease towards the scroll position so fast scrolling still looks smooth.
    const tick = () => {
      raf = 0;
      if (!v.duration) return;
      target = progress() * (v.duration - 0.05);
      shown += (target - shown) * 0.18;
      if (Math.abs(target - shown) < 0.01) shown = target;
      if (Math.abs(v.currentTime - shown) > 0.01) v.currentTime = shown;
      // Darker veil over the bright middle of the video (map, building, office).
      if (veil.current)
        veil.current.style.opacity = String(0.35 + 0.25 * Math.sin(progress() * Math.PI));
      if (shown !== target) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLoaded = () => {
      v.pause();
      setReady(true);
      kick();
    };

    v.addEventListener("loadedmetadata", kick);
    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("canplay", onLoaded);
    if (v.readyState >= 2) onLoaded();
    else if (v.readyState === 0) v.load();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      v.removeEventListener("loadedmetadata", kick);
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("canplay", onLoaded);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      cancelAnimationFrame(raf);
    };
  }, [src]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-navy-deep">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${base}/bg/journey-poster.jpg`}
        alt=""
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-700",
          ready && !still ? "opacity-0" : "opacity-100",
        )}
      />
      {src && (
        <video
          ref={video}
          muted
          playsInline
          preload="auto"
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <source src={`${src}.webm`} type="video/webm" />
          <source src={`${src}.mp4`} type="video/mp4" />
        </video>
      )}
      {/* keeps text readable over the footage */}
      <div ref={veil} className="absolute inset-0 bg-navy-deep" style={{ opacity: 0.35 }} />
    </div>
  );
}
