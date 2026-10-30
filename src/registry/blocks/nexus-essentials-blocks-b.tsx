"use client";

/**
 * Tile previews for the Nexus essentials blocks, batch B: the parallax slider, card rail, sticky scroll
 * story, beam timeline and stacking cards. The slider and rail demo themselves with `autoplay`. The three
 * scroll-linked ones scroll inside their own frame, so they behave the same in a tile as on a page.
 */

import { BeamTimeline } from "@/components/blocks/motion-kit/beam-timeline";
import { CardRail } from "@/components/blocks/motion-kit/card-rail";
import { ParallaxSlider } from "@/components/blocks/motion-kit/parallax-slider";
import { StackingCards } from "@/components/blocks/motion-kit/stacking-cards";
import { StickyScrollStory } from "@/components/blocks/motion-kit/sticky-scroll-story";
import { BentoFeatures } from "@/components/blocks/motion-kit/bento-features";

export function PreviewBlockVariantMkParallaxSlider() {
  return (
    <div className="flex min-h-[560px] w-full items-center bg-white dark:bg-black">
      <ParallaxSlider autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkCardRail() {
  return (
    <div className="flex min-h-[520px] w-full items-center bg-white dark:bg-black">
      <CardRail autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkStickyScrollStory() {
  return (
    <div className="flex min-h-[660px] w-full items-center bg-white dark:bg-black">
      <StickyScrollStory />
    </div>
  );
}

export function PreviewBlockVariantMkBentoFeatures() {
  return (
    <div className="flex min-h-[640px] w-full items-center justify-center bg-[#f5f5f7] p-4 dark:bg-[#f5f5f7] sm:p-6">
      <BentoFeatures />
    </div>
  );
}

export function PreviewBlockVariantMkBeamTimeline() {
  return (
    <div className="flex min-h-[670px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <BeamTimeline />
    </div>
  );
}

export function PreviewBlockVariantMkStackingCards() {
  return (
    <div className="flex min-h-[670px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <StackingCards />
    </div>
  );
}
