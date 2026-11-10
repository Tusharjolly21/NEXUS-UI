"use client";

/**
 * Motion Kit previews (batch 25): Gold Star Rating. The card plays its own demo (four, two, five) until the
 * visitor touches it, so the preview only adds a light stage around it.
 */

import { GoldStarRating } from "@/components/gold-star-rating";

export function PreviewGoldStarRating({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 ${compact ? "min-h-[300px]" : "min-h-[420px]"}`}>
      <div className={compact ? "w-full max-w-[340px]" : "w-full max-w-[380px] [&>div]:w-full"}>
        <GoldStarRating autoplay />
      </div>
    </div>
  );
}
