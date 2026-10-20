"use client";

/**
 * Motion Kit previews (set F): physics and motion studies brought over from the Motion Kit design.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over,
 * so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { GlassBubbles } from "@/components/glass-bubbles";
import { BoxSpill } from "@/components/box-spill";
import { CurvedReel } from "@/components/curved-reel";
import { SqueezeProgress } from "@/components/squeeze-progress";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewGlassBubbles({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <GlassBubbles autoplay />
    </Stage>
  );
}

export function PreviewBoxSpill({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <BoxSpill autoplay />
    </Stage>
  );
}

export function PreviewCurvedReel({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="px-0">
      <CurvedReel autoplay />
    </Stage>
  );
}

export function PreviewSqueezeProgress({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SqueezeProgress autoplay />
    </Stage>
  );
}
