"use client";

import { RealTimeCursors } from "@/components/real-time-cursors";

export function PreviewRealTimeCursorsRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <RealTimeCursors autoplay className={compact ? "max-w-[540px]" : ""} />
    </div>
  );
}
