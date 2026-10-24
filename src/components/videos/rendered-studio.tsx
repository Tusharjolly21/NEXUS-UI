"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { AccessTag } from "@/components/pro/pro-access";
import { cn } from "@/lib/utils";
import { FORMATS, videoPosterSrc, type FormatId, type VideoEntry } from "@/lib/catalog/videos";

/** How wide the player may grow for a shape: tall shapes stay phone-sized, wide ones get the page. */
const maxWidthFor = (w: number, h: number) => (h > w * 1.2 ? 380 : w / h > 1.5 ? 880 : w === h ? 520 : 440);

/**
 * The page body for a finished film (a video with `files`): the film itself with the browser's own
 * controls and sound, a switch between its shapes, and a download for each. There is nothing to
 * edit, no prompt and no source, and nothing here is gated.
 */
export function RenderedStudio({ video }: { video: VideoEntry }) {
  const files = video.files ?? {};
  const formats = video.formats.filter((f) => files[f]);
  const [format, setFormat] = React.useState<FormatId>(formats[0] ?? video.formats[0]);
  const shape = FORMATS[format];
  const tall = shape.h > shape.w * 1.2;
  const src = files[format];

  return (
    <div className={cn("grid items-start gap-10", tall && "lg:grid-cols-[minmax(300px,380px)_1fr] lg:gap-14")}>
      <div className={cn("w-full", tall ? "mx-auto lg:sticky lg:top-24" : "mx-auto lg:mx-0")} style={{ maxWidth: maxWidthFor(shape.w, shape.h) }}>
        {formats.length > 1 ? (
          <div role="radiogroup" aria-label="Video shape" className="mb-3 flex flex-wrap justify-center gap-1 lg:justify-start">
            {formats.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={id === format}
                onClick={() => setFormat(id)}
                className={cn(
                  "h-8 rounded-full px-3.5 text-[13px] font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  id === format ? "bg-foreground text-background" : "bg-foreground/[0.07] text-foreground/70 hover:text-foreground",
                )}
              >
                {FORMATS[id].label}
              </button>
            ))}
          </div>
        ) : null}
        <div className={cn("bg-foreground/[0.06] shadow-[0_0_0_0.5px_var(--border),0_40px_80px_-40px_rgba(0,0,0,0.45)]", tall ? "rounded-[40px] p-2.5" : "rounded-[28px] p-2")}>
          {src ? (
            <video
              key={src}
              src={src}
              poster={videoPosterSrc(video.slug)}
              controls
              playsInline
              preload="metadata"
              style={{ aspectRatio: `${shape.w} / ${shape.h}` }}
              className={cn("block w-full bg-black object-contain", tall ? "rounded-[32px]" : "rounded-[20px]")}
            >
              Your browser can&apos;t play this video. You can download it below.
            </video>
          ) : null}
        </div>
        <p className="mt-4 text-center text-[13px] text-muted-foreground lg:text-left">
          {video.duration} seconds · press play for sound
          {formats.length > 1 ? ` · ${shape.where}` : ""}
        </p>
      </div>

      <div className="min-w-0">
        <div className="grid gap-5">
          <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              ["For", video.purpose],
              ["Motion", video.motion],
              ["Made for", video.app],
              ["Length", `${video.duration}s, ${formats.map((f) => FORMATS[f].label).join(" / ")}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-foreground/[0.05] px-3.5 py-3">
                <dt className="text-[11.5px] font-semibold text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 text-[13.5px] font-medium leading-snug text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-[20px] bg-foreground/[0.05] p-5">
            <div className="flex items-center gap-2.5">
              <p className="text-[14px] font-semibold text-foreground">Free to download and post</p>
              <AccessTag premium={false} />
            </div>
            <p className="mt-2 text-[14px] leading-[1.55] text-foreground/80">
              This one is a finished film, so there is nothing to edit or render. Download the MP4 for the shape you need and post it where it fits:{" "}
              {video.platforms.join(", ")}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {formats.map((id) => (
              <a
                key={id}
                href={files[id]}
                download
                className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Download className="size-4" aria-hidden />
                Download {FORMATS[id].label} MP4
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
