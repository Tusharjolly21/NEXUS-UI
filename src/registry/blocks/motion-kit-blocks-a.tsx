"use client";

/**
 * Tile previews for the Motion Kit blocks ported in batch "a". Each export renders one block
 * with autoplay on, sized to fill a 1280x860 canvas.
 */

import { MorphingNav } from "@/components/blocks/motion-kit/morphing-nav";
import { SpotlightHero } from "@/components/blocks/motion-kit/spotlight-hero";
import { HalftonePlanet } from "@/components/blocks/motion-kit/halftone-planet";
import { ParallaxStackHero } from "@/components/blocks/motion-kit/parallax-stack-hero";
import { LoupeLogoCloud } from "@/components/blocks/motion-kit/loupe-logo-cloud";

const fill = "flex min-h-[860px] flex-col justify-center";

export function PreviewBlockVariantMkMorphingNav() {
  return (
    <div className="w-full bg-[#f5f5f7] dark:bg-black">
      <div className="flex min-h-[860px] flex-col bg-[#fbfbfd] dark:bg-black">
        <MorphingNav autoplay />
        {/* Placeholder page body so the nav reads in context. */}
        <div className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col items-center gap-4 px-6 pb-16 pt-4 text-center" aria-hidden="true">
          <span className="h-3 w-24 rounded-full bg-black/[.06] dark:bg-white/[.08]" />
          <span className="h-10 w-full max-w-[560px] rounded-2xl bg-black/[.05] dark:bg-white/[.07]" />
          <span className="h-10 w-full max-w-[420px] rounded-2xl bg-black/[.05] dark:bg-white/[.07]" />
          <span className="mt-2 h-3 w-full max-w-[480px] rounded-full bg-black/[.04] dark:bg-white/[.06]" />
          <span className="h-3 w-full max-w-[400px] rounded-full bg-black/[.04] dark:bg-white/[.06]" />
        </div>
      </div>
    </div>
  );
}

export function PreviewBlockVariantMkSpotlightHero() {
  return (
    <div className="w-full bg-[#f5f5f7] dark:bg-black">
      <SpotlightHero autoplay className="min-h-[860px]" />
    </div>
  );
}

export function PreviewBlockVariantMkHalftonePlanet() {
  return (
    <div className="w-full bg-[#f5f5f7] dark:bg-black">
      <HalftonePlanet autoplay className={fill} />
    </div>
  );
}

export function PreviewBlockVariantMkParallaxStackHero() {
  return (
    <div className="w-full bg-[#f5f5f7] dark:bg-black">
      <ParallaxStackHero autoplay className={fill} />
    </div>
  );
}

export function PreviewBlockVariantMkLoupeLogoCloud() {
  return (
    <div className="w-full bg-[#f5f5f7] dark:bg-black">
      <LoupeLogoCloud autoplay className={fill} />
    </div>
  );
}
