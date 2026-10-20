"use client";

import { TickSlider } from "@/components/tick-slider";

export function PreviewTickSliderRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <TickSlider label="Volume" defaultValue={62} unit="%" ticks={compact ? 30 : 36} autoplay />
    </div>
  );
}
