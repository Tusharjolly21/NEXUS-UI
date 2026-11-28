"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { WarpSpeedCard, WarpTextTrigger } from "@/components/warp-speed-card";

export function PreviewWarpSpeedCard() {
  return (
    <WarpSpeedCard className="w-full overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
      <div className="flex h-full min-h-[260px] flex-col items-center justify-center px-8 py-12 text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-950 sm:text-4xl">
          Build amazing websites
          <br />
          at <WarpTextTrigger>warp speed</WarpTextTrigger>
        </h2>
      </div>
    </WarpSpeedCard>
  );
}
