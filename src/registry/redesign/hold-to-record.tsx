"use client";

import { HoldToRecord } from "@/components/hold-to-record";

export function PreviewHoldToRecordRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-5 p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <HoldToRecord autoplay />
      {!compact ? (
        <span className="mt-6 text-[12px] text-[#86868b] dark:text-[#98989d]">Press and hold. Slide left to throw it away.</span>
      ) : null}
    </div>
  );
}
