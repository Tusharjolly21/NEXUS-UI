"use client";

import * as React from "react";
import Link from "next/link";
import { AccessTag } from "@/components/pro/pro-access";
import { cn } from "@/lib/utils";
import { videoFormat, videoPosterSrc, videoPreviewSrc, type VideoEntry } from "@/lib/catalog/videos";

/**
 * One video in the grid: its still, and a silent pre-rendered loop that plays on hover or focus
 * (and by itself while on screen on touch devices). No animation code loads until the page opens.
 */
export function VideoCard({ video, className, priority = false }: { video: VideoEntry; className?: string; priority?: boolean }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [on, setOn] = React.useState(false);
  const shape = videoFormat(video);

  const play = React.useCallback(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setOn(true);
    void v.play().catch(() => {});
  }, []);
  const stop = React.useCallback(() => {
    const v = ref.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setOn(false);
  }, []);

  // Touch screens have no hover: play while the card is mostly in view instead.
  React.useEffect(() => {
    const v = ref.current;
    if (!v || !window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.intersectionRatio > 0.6 ? play() : stop()), { threshold: [0, 0.6] });
    io.observe(v);
    return () => io.disconnect();
  }, [play, stop]);

  return (
    <Link
      href={`/videos/${video.slug}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && play()}
      onPointerLeave={(e) => e.pointerType === "mouse" && stop()}
      onFocus={play}
      onBlur={stop}
      className={cn("pg-float group block overflow-hidden rounded-[24px] bg-card transition-transform duration-150 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring", className)}
    >
      <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: `${shape.w} / ${shape.h}` }}>
        <video
          ref={ref}
          src={videoPreviewSrc(video.slug)}
          poster={videoPosterSrc(video.slug)}
          muted
          loop
          playsInline
          preload={priority ? "metadata" : "none"}
          aria-hidden
          className="absolute inset-0 size-full object-cover"
        />
        <span className="absolute left-3 top-3">
          <AccessTag premium={video.premium} />
        </span>
        <span className={cn("absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] font-medium tabular-nums text-white backdrop-blur transition-opacity", on ? "opacity-0" : "opacity-100")}>
          {video.duration}s{video.loop ? " loop" : ""}
        </span>
      </div>
      <div className="px-4 py-3.5">
        <p className="truncate text-[15px] font-semibold tracking-[-0.2px] text-foreground">{video.title}</p>
        <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{video.purpose}</p>
      </div>
    </Link>
  );
}
