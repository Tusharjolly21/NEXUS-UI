"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type TutorialChapter = { at: number; title: string };

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * The tutorial video with a clickable chapter list. Pressing a chapter jumps the video there and
 * plays it; the chapter that is playing stays highlighted, with a bar that fills as it plays.
 * The video's own controls still work for pausing, scrubbing, speed and full screen.
 */
export function TutorialPlayer({
  src,
  poster,
  chapters,
  duration,
}: {
  src: string;
  poster: string;
  chapters: TutorialChapter[];
  duration: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const on = () => setTime(v.currentTime);
    v.addEventListener("timeupdate", on);
    v.addEventListener("seeked", on);
    return () => {
      v.removeEventListener("timeupdate", on);
      v.removeEventListener("seeked", on);
    };
  }, []);

  const jump = useCallback((at: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = at;
    setTime(at);
    void v.play().catch(() => {});
  }, []);

  const current = chapters.reduce((acc, c, i) => (time >= c.at ? i : acc), 0);

  return (
    <div data-doc-widget className="space-y-4">
      <div className="overflow-hidden rounded-[22px] bg-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_24px_48px_-28px_rgba(0,0,0,0.45)]">
        <video
          ref={video}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="block aspect-video w-full"
          aria-label="Video tutorial: add Nexus UI to a project in VS Code"
        />
      </div>

      <nav aria-label="Chapters">
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {chapters.map((c, i) => {
            const end = chapters[i + 1]?.at ?? duration;
            const on = i === current;
            const fill = on ? Math.min(1, Math.max(0, (time - c.at) / (end - c.at))) : 0;
            return (
              <li key={c.at}>
                <button
                  type="button"
                  onClick={() => jump(c.at)}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3 overflow-hidden rounded-[14px] px-3.5 py-2.5 text-left text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    on ? "bg-card text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                  )}
                >
                  <span className="w-11 shrink-0 font-mono text-[13px] tabular-nums text-muted-foreground">{fmt(c.at)}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{c.title}</span>
                  <Play
                    aria-hidden
                    className={cn("size-3.5 shrink-0 transition-opacity", on ? "opacity-70" : "opacity-0 group-hover:opacity-60")}
                  />
                  {on ? (
                    <span aria-hidden className="absolute bottom-0 left-0 h-[2px] bg-[#0071e3]" style={{ width: `${fill * 100}%` }} />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
