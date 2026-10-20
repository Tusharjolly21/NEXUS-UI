"use client";

import { BentoGridSkeleton, DEFAULT_SKELETON_CARDS } from "@/components/bento-grid-skeleton";

export function PreviewBentoGridSkeletonRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <BentoGridSkeleton
        autoplay
        cards={compact ? DEFAULT_SKELETON_CARDS.slice(0, 4).map((c) => ({ ...c, span: "1x1" as const })) : DEFAULT_SKELETON_CARDS}
        className={compact ? "max-w-[560px]" : "max-w-[920px]"}
      />
    </div>
  );
}
