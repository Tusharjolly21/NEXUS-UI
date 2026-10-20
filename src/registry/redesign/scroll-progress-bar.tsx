"use client";

import { useRef } from "react";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

const CHAPTERS = [
  { title: "Intro", body: "A progress rail tells a reader where they are and how much is left, without asking them to look away from the words." },
  { title: "Build", body: "The fill springs after your scroll instead of snapping to it, so quick flicks feel soft and slow reads feel steady." },
  { title: "Polish", body: "A bead rides the tip and stretches while you move fast, then settles round again the moment you stop." },
  { title: "Ship", body: "Every milestone pops as you pass it. Click a label to jump straight to that chapter." },
];

export function PreviewScrollProgressBarRedesign({ compact = false }: { compact?: boolean } = {}) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[520px] flex-col items-center gap-3">
        <div className="flex w-full gap-5 rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
          <ScrollProgressBar
            containerRef={box}
            height={compact ? 220 : 250}
            labels={CHAPTERS.map((c) => c.title)}
            ariaLabel="Article progress"
            autoplay
            className="shrink-0 py-1"
          />
          <div
            ref={box}
            tabIndex={0}
            aria-label="Article"
            className="min-w-0 flex-1 overflow-y-auto rounded-[14px] outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] [&::-webkit-scrollbar]:hidden"
            style={{ height: compact ? 228 : 258, maskImage: "linear-gradient(180deg, transparent, #000 18px, #000 calc(100% - 28px), transparent)", WebkitMaskImage: "linear-gradient(180deg, transparent, #000 18px, #000 calc(100% - 28px), transparent)" }}
          >
            {CHAPTERS.map((c, i) => (
              <section key={c.title} className={`${i === 0 ? "pt-3" : ""} ${i === CHAPTERS.length - 1 ? "pb-8" : "pb-24"}`}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0071e3] dark:text-[#0a84ff]">Chapter {i + 1}</p>
                <h3 className="mt-1 text-[22px] font-semibold leading-tight tracking-[-0.03em]">{c.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">{c.body}</p>
              </section>
            ))}
          </div>
        </div>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Scroll the article, or tap a chapter.</span>
      </div>
    </div>
  );
}
