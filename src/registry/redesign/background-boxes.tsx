"use client";

import { BackgroundBoxes } from "@/components/background-boxes";

export function PreviewBackgroundBoxesRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <BackgroundBoxes
        autoplay
        className={`w-full max-w-[560px] rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#111113] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)] ${compact ? "h-[300px]" : "h-[340px]"}`}
      >
        <div className="pointer-events-none flex h-full flex-col items-center justify-center px-6 text-center">
          <h3 className="text-[30px] font-semibold leading-tight tracking-[-0.045em] sm:text-[36px]">Every cell is a key.</h3>
          <p className="mt-2 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Run the pointer across the grid.</p>
        </div>
      </BackgroundBoxes>
    </div>
  );
}
