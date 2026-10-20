"use client";

import { ImageTrail } from "@/components/image-trail";

export function PreviewImageTrailRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <ImageTrail autoplay imageSize={compact ? 96 : 112} className={compact ? "h-[300px]" : "h-[340px]"} />
    </div>
  );
}

export function PreviewImageTrailMagnetic({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <ImageTrail magneticEffect magneticStrength={0.5} spacing={36} duration={1600} imageSize={compact ? 84 : 96} cornerRadius={48} className={compact ? "h-[300px]" : "h-[340px]"}>
        <div className="pointer-events-none flex h-full flex-col items-center justify-center text-center">
          <p className="m-0 text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">Summer, collected.</p>
          <p className="m-0 mt-1 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Move around, then sweep through the pile.</p>
        </div>
      </ImageTrail>
    </div>
  );
}
