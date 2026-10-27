"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { videoPosterSrc, videoPreviewSrc } from "@/lib/catalog/videos";

/**
 * Plays a HyperFrames video: the MP4 that `npx hyperframes render` made from its index.html (picture
 * and soundtrack in one file), loaded from /videos/previews. It starts muted and looping, and the
 * speaker button turns the sound on (browsers only allow sound after a press). It waits on its still
 * frame for visitors who prefer reduced motion, and pauses while off screen.
 */
export function HyperframesPlayer({ slug, w, h, className }: { slug: string; w: number; h: number; className?: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [sound, setSound] = React.useState(false);

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

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    const next = !sound;
    v.muted = !next;
    setSound(next);
    if (next) void v.play().catch(() => {});
  };

  return (
    <div className="relative">
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
        controlsList="nodownload"
        preload="metadata"
        onVolumeChange={(e) => setSound(!e.currentTarget.muted)}
        aria-label="Video preview"
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={sound}
        aria-label={sound ? "Turn the sound off" : "Turn the sound on"}
        className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {sound ? <Volume2 className="size-[18px]" aria-hidden /> : <VolumeX className="size-[18px]" aria-hidden />}
      </button>
    </div>
  );
}
