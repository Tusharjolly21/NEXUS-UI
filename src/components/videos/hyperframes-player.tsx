"use client";

import * as React from "react";
import { videoPosterSrc, videoPreviewSrc } from "@/lib/catalog/videos";

/**
 * Plays a HyperFrames video: the MP4 that `npx hyperframes render` made from its index.html, loaded
 * from /videos/previews. These videos have no soundtrack, so it is a muted loop with the browser's own
 * controls. It waits on its still frame for visitors who prefer reduced motion, and pauses while off screen.
 */
export function HyperframesPlayer({ slug, w, h, className }: { slug: string; w: number; h: number; className?: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduce) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      style={{ display: "block", width: "100%", height: "auto", aspectRatio: `${w} / ${h}`, background: "#000" }}
      src={videoPreviewSrc(slug)}
      poster={videoPosterSrc(slug)}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      aria-label="Video preview, no sound"
    />
  );
}
