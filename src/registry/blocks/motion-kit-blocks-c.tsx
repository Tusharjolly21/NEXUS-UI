"use client";

/**
 * Tile previews for the Motion Kit blocks in group C: features, social proof and pricing sections.
 * Each renders the block with autoplay so the tile moves without being scrolled or touched.
 */

import { BeamPricing } from "@/components/blocks/motion-kit/beam-pricing";
import { CountingStats } from "@/components/blocks/motion-kit/counting-stats";
import { DrawnTimeline } from "@/components/blocks/motion-kit/drawn-timeline";
import { IntegrationsOrbit } from "@/components/blocks/motion-kit/integrations-orbit";
import { SeatRulerPricing } from "@/components/blocks/motion-kit/seat-ruler-pricing";
import { WallOfLove } from "@/components/blocks/motion-kit/wall-of-love";

export function PreviewBlockVariantMkDrawnTimeline() {
  return (
    <div className="w-full min-h-[860px] bg-[#f5f5f7] dark:bg-black">
      <DrawnTimeline autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkIntegrationsOrbit() {
  return (
    <div className="grid w-full min-h-[860px] content-center bg-[#f5f5f7] dark:bg-black">
      <IntegrationsOrbit autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkCountingStats() {
  return (
    <div className="grid w-full min-h-[860px] content-center bg-[#f5f5f7] dark:bg-black">
      <CountingStats autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkWallOfLove() {
  return (
    <div className="w-full min-h-[860px] bg-[#f5f5f7] dark:bg-black">
      <WallOfLove autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkSeatRulerPricing() {
  return (
    <div className="grid w-full min-h-[860px] content-center bg-[#f5f5f7] dark:bg-black">
      <SeatRulerPricing autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkBeamPricing() {
  return (
    <div className="grid w-full min-h-[860px] content-center bg-[#f5f5f7] dark:bg-black">
      <BeamPricing autoplay />
    </div>
  );
}
