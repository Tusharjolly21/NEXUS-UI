"use client";

import { WarpSpeedCard, WarpTextTrigger } from "@/components/warp-speed-card";

export function PreviewWarpSpeedCardRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-3">
        <WarpSpeedCard className="w-full">
          <div className={`flex flex-col items-center px-6 text-center ${compact ? "py-10" : "py-14"}`}>
            <h2 className={`m-0 font-semibold leading-[1.14] tracking-[-0.035em] ${compact ? "text-[30px]" : "text-[36px] sm:text-[40px]"}`}>
              Build amazing websites
              <br />
              at <WarpTextTrigger autoplay>warp speed</WarpTextTrigger>
            </h2>
          </div>
        </WarpSpeedCard>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Hover the phrase to jump. Tap or press Enter on touch and keyboard.</span>
      </div>
    </div>
  );
}
