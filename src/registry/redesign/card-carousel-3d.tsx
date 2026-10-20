"use client";

import { CardCarousel3D } from "@/components/card-carousel-3d";

export function PreviewCardCarousel3DRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <CardCarousel3D autoplay itemWidth={compact ? 160 : 176} itemHeight={compact ? 210 : 228} hint={compact ? "" : undefined} />
    </div>
  );
}
