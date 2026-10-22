"use client";

/**
 * Tile previews for the Motion Kit blocks ported in batch "g". The clothesline runs on a small
 * hand-written rope simulation (no physics library), so it is imported directly.
 */

import { Clothesline } from "@/components/blocks/motion-kit/clothesline";

export function PreviewBlockVariantMkClothesline() {
  return (
    <div className="flex min-h-[560px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <Clothesline autoplay />
    </div>
  );
}
