"use client";

import * as React from "react";
import { VIDEO_HEIGHT, VIDEO_WIDTH } from "@/lib/catalog/videos";
import { VIDEO_COMPONENTS } from "./registry";

/**
 * One frame of a video, scaled to fit its container's width. The videos are drawn on a fixed
 * 1080×1920 canvas; this shrinks that canvas with a transform so the layout, type and motion stay
 * exactly as designed at any size.
 */
export function VideoStage({
  slug,
  t,
  values,
  poster,
  className,
}: {
  slug: string;
  t: number;
  values?: Record<string, unknown>;
  /** Shown until the video code has loaded and drawn its first frame. */
  poster?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0);
  const Comp = VIDEO_COMPONENTS[slug];
  const known = slug in VIDEO_COMPONENTS;

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / VIDEO_WIDTH);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ position: "relative", overflow: "hidden", aspectRatio: `${VIDEO_WIDTH} / ${VIDEO_HEIGHT}` }}>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" aria-hidden draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}
      {known && scale > 0 ? (
        <div aria-hidden style={{ position: "absolute", left: 0, top: 0, width: VIDEO_WIDTH, height: VIDEO_HEIGHT, transform: `scale(${scale})`, transformOrigin: "0 0", pointerEvents: "none" }}>
          <React.Suspense fallback={null}>
            <Comp t={t} {...values} />
          </React.Suspense>
        </div>
      ) : null}
    </div>
  );
}
