"use client";

/**
 * Motion Kit previews (batch 24): Murmur, Loupe Lens.
 * It fills a positioned parent, so the stage is a relative box with a floor height.
 */

import { Murmur } from "@/components/murmur";
import { LoupeLens } from "@/components/loupe-lens";

export function PreviewMurmur({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`relative h-full w-full bg-[#f5f5f7] ${compact ? "min-h-[380px]" : "min-h-[560px]"}`}>
      <Murmur height="fill" autoplay />
    </div>
  );
}

export function PreviewLoupeLens({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`relative h-full w-full bg-[#f5f5f7] ${compact ? "min-h-[380px]" : "min-h-[560px]"}`}>
      <LoupeLens height="fill" autoplay />
    </div>
  );
}
