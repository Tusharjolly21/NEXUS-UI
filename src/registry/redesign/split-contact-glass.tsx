"use client";

import { SplitContact } from "@/components/split-contact-glass";

export function PreviewSplitContactGlassRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[900px] flex-col items-center gap-3">
        <SplitContact autoplay intro={compact ? "" : undefined} />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Pick a topic, write a line, and send it off.</span>
      </div>
    </div>
  );
}
