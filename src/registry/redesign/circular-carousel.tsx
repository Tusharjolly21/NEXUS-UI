"use client";

import { CircularCarousel } from "@/components/circular-carousel";

export function PreviewCircularCarouselRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <CircularCarousel autoplay hint={compact ? "" : undefined} />
    </div>
  );
}
