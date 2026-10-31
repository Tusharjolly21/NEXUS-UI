"use client";

/**
 * Motion Kit previews (batch 16): Pluck Frame, Dust Snap, Glass Drop and Status Morph.
 * It plays its own demo (autoplay) until a real pointer arrives, so the preview only adds the light page.
 */

import { PluckFrame } from "@/components/pluck-frame";
import { DustSnap } from "@/components/dust-snap";
import { GlassDrop } from "@/components/glass-drop";
import { StatusMorph } from "@/components/status-morph";

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

/**
 * Glass Drop plays its own intro when it comes into view, so the preview only gives it a light page and a
 * stage tall enough for the glass icon to read. Its own controls stay on so the dark, light and blue looks
 * and both endings can be tried right on the tile.
 */
export function PreviewGlassDrop({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[320px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[860px]">
        <GlassDrop height={compact ? 300 : 440} />
      </div>
    </div>
  );
}

/** Status Morph connects and lets go by itself (autoplay) until it is tapped; the preview gives it the light page. */
export function PreviewStatusMorph({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[280px]" : "min-h-[380px]"}`}>
      <StatusMorph autoplay size={compact ? 240 : 300} />
    </div>
  );
}
