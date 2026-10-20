"use client";

import { SpectraFrame } from "@/components/spectra-frame";

export function PreviewSpectraFrameRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="w-full max-w-[540px]">
        <SpectraFrame autoplay cellMinHeight={compact ? 116 : 128} hoveredMinHeight={compact ? 156 : 176} hint={compact ? "" : undefined} />
      </div>
    </div>
  );
}
