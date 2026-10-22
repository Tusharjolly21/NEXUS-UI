"use client";

/**
 * Tile previews for the navigation blocks ported from the essentials batch: the scroll navbar, the morph
 * menu and the announcement bar. Each sits in a contained frame so it previews the same in a tile and on
 * the page.
 */

import { useRef } from "react";
import { AnnounceBar } from "@/components/blocks/motion-kit/announce-bar";
import { MorphMenu } from "@/components/blocks/motion-kit/morph-menu";
import { ScrollNavbar, ScrollNavbarDemoPage } from "@/components/blocks/motion-kit/scroll-navbar";

export function PreviewBlockVariantMkScrollNavbar() {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div className="flex min-h-[660px] w-full items-center justify-center bg-[#f5f5f7] px-4 py-8 dark:bg-black">
      <div className="relative h-[600px] w-full max-w-[1080px] overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-black dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]">
        <div ref={box} className="h-full overflow-y-auto overscroll-contain">
          <ScrollNavbar scrollRef={box} />
          <ScrollNavbarDemoPage />
        </div>
      </div>
    </div>
  );
}

export function PreviewBlockVariantMkMorphMenu() {
  return (
    <div className="flex min-h-[420px] w-full flex-col bg-[#fbfbfd] dark:bg-black">
      <MorphMenu autoplay className="min-h-[420px] flex-1" />
    </div>
  );
}

export function PreviewBlockVariantMkAnnounceBar() {
  return (
    <div className="flex min-h-[420px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <AnnounceBar />
    </div>
  );
}
