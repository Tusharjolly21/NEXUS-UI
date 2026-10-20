"use client";

/**
 * Motion Kit previews (set K): falloff accordion, magnet select, aspect crop, slosh slider
 * and goo reorder. Every component ships an `autoplay` mode that demonstrates itself until
 * someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { FalloffAccordion } from "@/components/falloff-accordion";
import { MagnetSelect } from "@/components/magnet-select";
import { AspectCrop } from "@/components/aspect-crop";
import { SloshSlider } from "@/components/slosh-slider";
import { GooReorder } from "@/components/goo-reorder";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewFalloffAccordion({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <FalloffAccordion autoplay />
    </Stage>
  );
}

export function PreviewMagnetSelect({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <MagnetSelect autoplay />
    </Stage>
  );
}

export function PreviewAspectCrop({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <AspectCrop autoplay />
    </Stage>
  );
}

export function PreviewSloshSlider({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SloshSlider autoplay />
    </Stage>
  );
}

export function PreviewGooReorder({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <GooReorder autoplay />
    </Stage>
  );
}
