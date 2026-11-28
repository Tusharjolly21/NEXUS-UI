"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

export function PreviewScrollProgressBar({ compact = true }: { compact?: boolean } = {}) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() === true;

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !compact || reduceMotion) return;

    let frame = 0;
    let pauseUntil = performance.now() + 900;
    let direction = 1;
    const tick = (time: number) => {
      const max = container.scrollHeight - container.clientHeight;
      if (time >= pauseUntil && max > 0) {
        container.scrollTop += direction * 0.72;
        if (container.scrollTop >= max - 1 || container.scrollTop <= 1) {
          direction *= -1;
          pauseUntil = time + 850;
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    container.scrollTop = 80;
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [compact, reduceMotion]);

  return (
    <div
      className={cn(
        "w-full overflow-hidden bg-[#0d0d10] text-white",
        compact ? "h-[760px]" : "h-[720px] rounded-3xl",
      )}
    >
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <section
          className="mx-auto grid min-h-[1160px] max-w-[900px] grid-cols-[38px_minmax(0,1fr)] gap-10 px-12 py-20 sm:px-20"
        >
          <aside className="sticky top-24 h-fit">
            <ScrollProgressBar
              containerRef={scrollContainerRef}
              height={240}
              width={3}
              markerCount={4}
              markerSize={12}
              backgroundColor="#282832"
              fillColor="#8758ff"
            />
          </aside>
          <div className="space-y-24">
            <header>
              <p className="text-xs font-semibold uppercase text-violet-400">
                Product Story
              </p>
              <h2 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.05]">
                Follow the work as it takes shape.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-8 text-white/50">
                A quiet progress rail keeps long sections oriented without
                competing with the content.
              </p>
            </header>
            {[
              ["01 / Discover", "Clarify the audience and find the moments that matter."],
              ["02 / Compose", "Arrange the interface into a story people can scan."],
              ["03 / Refine", "Tune detail and motion until each interaction feels intentional."],
              ["04 / Launch", "Deliver a system ready for real users and real content."],
            ].map(([label, body]) => (
              <article key={label} className="border-t border-white/10 pt-8">
                <p className="text-sm font-medium text-violet-300">{label}</p>
                <p className="mt-4 max-w-lg text-2xl leading-snug text-white/80">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
