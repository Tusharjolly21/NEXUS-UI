"use client";

import { CursorBuddy } from "@/components/cursor-buddy";

export function PreviewCursorBuddyRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-end gap-6 sm:gap-8">
          <CursorBuddy autoplay shape="pill" fill="dark" eyes="slits" size={compact ? 56 : 64} sleepAfter={0} />
          <CursorBuddy autoplay shape="squircle" size={compact ? 104 : 120} />
          <CursorBuddy autoplay shape="circle" fill="#ff9f0a" eyes="squares" size={compact ? 60 : 68} sleepAfter={0} />
        </div>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Move the pointer. Poke one.</span>
      </div>
    </div>
  );
}
