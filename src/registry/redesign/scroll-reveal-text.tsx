"use client";

import { useRef } from "react";
import { ScrollRevealText } from "@/components/scroll-reveal-text";

export function PreviewScrollRevealTextRedesign({ compact = false }: { compact?: boolean } = {}) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[460px] flex-col items-center gap-3">
        <div className="relative w-full overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]">
          <div
            ref={box}
            tabIndex={0}
            aria-label="Scrollable story"
            className={`relative overflow-y-auto overscroll-contain px-7 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] ${compact ? "h-[250px]" : "h-[280px]"}`}
          >
            <div className="h-[200px]" />
            <ScrollRevealText
              container={box}
              autoplay
              startOffset={0.22}
              endOffset={0.5}
              stagger={0.7}
              text="We design tools that people actually want to open every single morning."
              fontSize={compact ? "26px" : "30px"}
            />
            <div className="h-[200px]" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-white to-transparent dark:from-[#1c1c1e]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-[#1c1c1e]" />
        </div>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Scroll inside the card to read it yourself.</span>
      </div>
    </div>
  );
}
