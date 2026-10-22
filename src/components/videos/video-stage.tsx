"use client";

import * as React from "react";
import { FORMATS, type FormatId } from "@/lib/catalog/videos";
import { VIDEO_COMPONENTS } from "./registry";

/**
 * One frame of a video, scaled to fit its container's width. Each video is drawn on a fixed canvas
 * for the chosen shape (1080×1920 for 9:16, 1920×1080 for 16:9, and so on); this shrinks that
 * canvas with a transform so the layout, type and motion stay exactly as designed at any size.
 */
export function VideoStage({
  slug,
  t,
  format = "9:16",
  values,
  poster,
  className,
}: {
  slug: string;
  t: number;
  /** The shape to draw; the video lays itself out for it. */
  format?: FormatId;
  values?: Record<string, unknown>;
  /** Shown until the video code has loaded and drawn its first frame. */
  poster?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0);
  const Comp = VIDEO_COMPONENTS[slug];
  const known = slug in VIDEO_COMPONENTS;
  const { w: W, h: H } = FORMATS[format];

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [W]);

  return (
    <div ref={ref} className={className} style={{ position: "relative", overflow: "hidden", aspectRatio: `${W} / ${H}` }}>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" aria-hidden draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : null}
      {known && scale > 0 ? (
        <div aria-hidden style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0", pointerEvents: "none" }}>
          <React.Suspense fallback={null}>
            <Comp t={t} w={W} h={H} {...values} />
          </React.Suspense>
        </div>
      ) : null}
    </div>
  );
}
