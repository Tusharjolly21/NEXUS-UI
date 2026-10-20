"use client";

import { WordMagnet } from "@/components/word-magnet";

export function PreviewWordMagnetRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[520px] flex-col items-center gap-6">
        <WordMagnet
          autoplay
          text="Push these words around and watch them wobble back into place"
          radius={compact ? 110 : 130}
          className={compact ? "max-w-[440px] text-[30px] sm:text-[34px]" : "max-w-[480px] text-[34px] sm:text-[42px]"}
        />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Sweep through the words, or drag a finger across them.</span>
      </div>
    </div>
  );
}
