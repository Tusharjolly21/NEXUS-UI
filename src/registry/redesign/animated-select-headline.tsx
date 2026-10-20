"use client";

import { AnimatedSelectHeadline } from "@/components/animated-select-headline";

export function PreviewAnimatedSelectHeadlineRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[520px] flex-col items-center gap-12">
        <AnimatedSelectHeadline
          words={["warp speed", "record time", "pure flow", "light speed"]}
          prefix="Build websites at"
          interval={2400}
          headingClassName={compact ? "text-[32px] sm:text-[36px]" : "text-[36px] sm:text-[44px]"}
        />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Click the selection, or use the arrow keys.</span>
      </div>
    </div>
  );
}
