"use client";

/**
 * Tile previews for the Motion Kit feature bentos, tabs and text sections (set b). Each renders
 * the section with autoplay on a quiet stage sized to fill the tile canvas.
 */

import type { ReactNode } from "react";
import { AutoAdvancingTabs } from "@/components/blocks/motion-kit/auto-advancing-tabs";
import { LiveDemoBento } from "@/components/blocks/motion-kit/live-demo-bento";
import { PulseBento } from "@/components/blocks/motion-kit/pulse-bento";
import { ScrambleHeading } from "@/components/blocks/motion-kit/scramble-heading";
import { ScrollReadManifesto } from "@/components/blocks/motion-kit/scroll-read-manifesto";

const fill = "grid min-h-[860px] content-center";

function Stage({ children }: { children: ReactNode }) {
  return <div className="w-full bg-[#f5f5f7] dark:bg-black">{children}</div>;
}

export function PreviewBlockVariantMkPulseBento() {
  return (
    <Stage>
      <PulseBento autoplay className={fill} />
    </Stage>
  );
}

export function PreviewBlockVariantMkLiveDemoBento() {
  return (
    <Stage>
      <LiveDemoBento autoplay className={fill} />
    </Stage>
  );
}

export function PreviewBlockVariantMkAutoAdvancingTabs() {
  return (
    <Stage>
      <AutoAdvancingTabs autoplay className={fill} />
    </Stage>
  );
}

export function PreviewBlockVariantMkScrambleHeading() {
  return (
    <Stage>
      <ScrambleHeading autoplay className={fill} />
    </Stage>
  );
}

export function PreviewBlockVariantMkScrollReadManifesto() {
  return (
    <Stage>
      <ScrollReadManifesto autoplay className={fill} />
    </Stage>
  );
}
