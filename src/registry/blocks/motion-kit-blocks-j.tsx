"use client";

/**
 * Tile previews for the Motion Kit blocks ported in batch "j". Each export renders one block
 * with autoplay on, sized to fill a 1280x860 canvas.
 */

import { HeadToHeadCompare } from "@/components/blocks/motion-kit/head-to-head-compare";
import { ReceiptHero } from "@/components/blocks/motion-kit/receipt-hero";
import { SealedAndSent } from "@/components/blocks/motion-kit/sealed-and-sent";
import { WallClockContact } from "@/components/blocks/motion-kit/wall-clock-contact";
import { WordmarkFooter } from "@/components/blocks/motion-kit/wordmark-footer";

export function PreviewBlockVariantMkHeadToHeadCompare() {
  return (
    <div className="w-full bg-[#f5f5f7] dark:bg-black">
      <HeadToHeadCompare autoplay className="min-h-[860px]" />
    </div>
  );
}

export function PreviewBlockVariantMkReceiptHero() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <ReceiptHero autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkSealedAndSent() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <SealedAndSent autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkWordmarkFooter() {
  return (
    <div className="flex min-h-[860px] w-full flex-col justify-end bg-[#f5f5f7] dark:bg-black">
      <WordmarkFooter autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkWallClockContact() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <WallClockContact autoplay className="w-full" />
    </div>
  );
}
