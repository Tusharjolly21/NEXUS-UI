"use client";

import { SquigglyDrinksHeadline } from "@/components/squiggly-text";

export function PreviewSquigglyTextRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex flex-col items-center gap-5">
        <SquigglyDrinksHeadline autoplay headingClassName={compact ? "text-[36px] sm:text-[40px]" : undefined} />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Sweep the pointer across the blue words to stir the ink.</span>
      </div>
    </div>
  );
}
