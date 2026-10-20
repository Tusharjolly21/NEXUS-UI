"use client";

/**
 * Tile previews for the Motion Kit blocks ported in batch "d". Each renders the full section with
 * autoplay on, so the tile demonstrates its interaction without a visitor touching it.
 */

import { CollapsingRail } from "@/components/blocks/motion-kit/collapsing-rail";
import { InstantSearchFaq } from "@/components/blocks/motion-kit/instant-search-faq";
import { SlideToPay } from "@/components/blocks/motion-kit/slide-to-pay";
import { TypoCatchingSignup } from "@/components/blocks/motion-kit/typo-catching-signup";
import { VoiceNoteContact } from "@/components/blocks/motion-kit/voice-note-contact";

export function PreviewBlockVariantMkSlideToPay() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <SlideToPay autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkInstantSearchFaq() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <InstantSearchFaq autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkCollapsingRail() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <CollapsingRail autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkVoiceNoteContact() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <VoiceNoteContact autoplay />
    </div>
  );
}

export function PreviewBlockVariantMkTypoCatchingSignup() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <TypoCatchingSignup autoplay />
    </div>
  );
}
