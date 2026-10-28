"use client";

/**
 * Motion Kit Pro previews (batch 13): Ring Gallery. The card plays its own demo (the camera drifts round
 * the ring until a real pointer moves in), so the preview only adds a light stage around it. The wheel is
 * not captured here, so scrolling past the preview scrolls the page.
 */

import { RingGallery } from "@/components/ring-gallery";
import { RING_PHOTOS } from "@/lib/catalog/ring-photos";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewRingGallery({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[640px]" : "w-full max-w-[820px]"}>
        <RingGallery items={RING_PHOTOS} autoplay captureWheel={false} />
      </div>
    </div>
  );
}
