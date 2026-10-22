"use client";

/**
 * Tile previews for the Motion Kit blocks ported in batch "i": the velocity marquee, logo stories and
 * the filterable logo wall.
 */

import { FilterableLogoWall } from "@/components/blocks/motion-kit/filterable-logo-wall";
import { LogoStories } from "@/components/blocks/motion-kit/logo-stories";
import { VelocityMarquee } from "@/components/blocks/motion-kit/velocity-marquee";

export function PreviewBlockVariantMkVelocityMarquee() {
  return (
    <div className="flex min-h-[320px] w-full items-center bg-white dark:bg-black">
      <VelocityMarquee />
    </div>
  );
}

export function PreviewBlockVariantMkLogoStories() {
  return (
    <div className="flex min-h-[460px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <LogoStories autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkFilterableLogoWall() {
  return (
    <div className="flex min-h-[460px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <FilterableLogoWall autoplay />
    </div>
  );
}
