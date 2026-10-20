"use client";

import { TimeScrubber } from "@/components/time-scrubber";

export function PreviewTimeScrubberRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <TimeScrubber label="Pickup" defaultValue={9 * 60 + 30} density={compact ? 1.3 : 1.6} autoplay />
    </div>
  );
}
