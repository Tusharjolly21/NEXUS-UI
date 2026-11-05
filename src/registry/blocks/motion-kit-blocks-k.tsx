"use client";

/**
 * Tile previews for the Motion Kit blocks ported in batch "k". Each export renders one block
 * with autoplay on, sized to fill a 1280x860 canvas.
 */

import { FluffyFooter } from "@/components/blocks/motion-kit/fluffy-footer";
import { BrokenBridge404 } from "@/components/blocks/motion-kit/broken-bridge-404";
import { PostalSignup } from "@/components/blocks/motion-kit/postal-signup";
import { SpotlightTour } from "@/components/blocks/motion-kit/spotlight-tour";
import { BrandReveal } from "@/components/blocks/motion-kit/brand-reveal";

export function PreviewBlockVariantMkFluffyFooter() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <FluffyFooter autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkBrokenBridge404() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <BrokenBridge404 autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkPostalSignup() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <PostalSignup autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkSpotlightTour() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <SpotlightTour autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkBrandReveal() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <BrandReveal autoplay className="w-full" />
    </div>
  );
}
