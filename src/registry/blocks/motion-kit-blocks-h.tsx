"use client";

/**
 * Tile previews for the Motion Kit hero blocks ported in batch "h": cursor crowd, x-ray lens,
 * circuit board canvas and flip-dot sign. Each brings its own background, so they are imported
 * directly and shown in their autoplay mode.
 */

import { CursorCrowdHero } from "@/components/blocks/motion-kit/cursor-crowd-hero";
import { XrayHero } from "@/components/blocks/motion-kit/xray-hero";
import { CircuitHero } from "@/components/blocks/motion-kit/circuit-hero";
import { FlipDotHero } from "@/components/blocks/motion-kit/flip-dot-hero";

export function PreviewBlockVariantMkCursorCrowdHero() {
  return (
    <div className="flex w-full items-center bg-white dark:bg-black">
      <CursorCrowdHero autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkXrayHero() {
  return (
    <div className="flex w-full items-center bg-white dark:bg-black">
      <XrayHero autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkCircuitHero() {
  return (
    <div className="flex w-full items-center bg-white dark:bg-black">
      <CircuitHero autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkFlipDotHero() {
  return (
    <div className="flex w-full items-center bg-white dark:bg-black">
      <FlipDotHero autoplay />
    </div>
  );
}
