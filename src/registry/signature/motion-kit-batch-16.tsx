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
 * Dust Snap snaps itself (autoplay) until a real click arrives. The preview fills the whole tile with the
 * card's own warm paper colour (no card, no shadow, no empty frame around it) so the word is as large as it can be.
 */
export function PreviewDustSnap({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#f2f0ec] dark:bg-[#f2f0ec] ${compact ? "min-h-[240px]" : "min-h-[360px]"}`}>
      <div className="w-full max-w-[820px]">
        <DustSnap autoplay framed={false} />
      </div>
    </div>
  );
}
