"use client";

import { WheelSelector } from "@/components/wheel-selector";

export function PreviewWheelSelectorRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <WheelSelector autoplay showCTA={!compact} ringRadius={compact ? 104 : 120} className={compact ? "max-w-[680px]" : "max-w-[760px]"} />
    </div>
  );
}
