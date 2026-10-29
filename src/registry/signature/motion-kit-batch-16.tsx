"use client";

/**
 * Motion Kit previews (batch 16): Pluck Frame and Dust Snap.
 * It plays its own demo (autoplay) until a real pointer arrives, so the preview only adds the light page.
 */

import { PluckFrame } from "@/components/pluck-frame";
import { DustSnap } from "@/components/dust-snap";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewPluckFrame({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[440px]" : "w-full max-w-[440px]"}>
        <PluckFrame autoplay />
      </div>
    </div>
  );
}

/**
 * Dust Snap snaps itself (autoplay) until a real click arrives. It sits as a card with room all round it,
 * large enough to read from the wall, and the word keeps clear of the card's edges.
 */
export function PreviewDustSnap({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[300px]" : "min-h-[420px]"}`}>
      <div className="w-full max-w-[620px]">
        <DustSnap autoplay />
      </div>
    </div>
  );
}
