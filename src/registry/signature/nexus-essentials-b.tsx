"use client";

/**
 * Nexus essentials previews (set B): step loader, skeleton morph, morphing dialog, travelling tooltip. Every component ships an
 * `autoplay` mode that demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { StepLoader } from "@/components/orbital-loader";
import { SkeletonMorph } from "@/components/skeleton-morph";
import { MorphingDialog } from "@/components/morphing-dialog";
import { TravellingTooltip } from "@/components/travelling-tooltip";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewStepLoader({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[480px]">
      <StepLoader autoplay />
    </Stage>
  );
}

export function PreviewSkeletonMorph({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[480px]">
      <SkeletonMorph autoplay />
    </Stage>
  );
}

export function PreviewMorphingDialog({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[440px]">
      <MorphingDialog autoplay />
    </Stage>
  );
}

export function PreviewTravellingTooltip({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[300px]">
      <TravellingTooltip autoplay />
    </Stage>
  );
}
