"use client";

/**
 * Motion Kit previews (set A): physics and canvas studies brought over from the Motion Kit design.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over,
 * so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { LanyardBadge } from "@/components/lanyard-badge";
import { GlassLens } from "@/components/glass-lens";
import { AsciiWake } from "@/components/ascii-wake";
import { LiquidDial } from "@/components/liquid-dial";
import { VoiceOrb } from "@/components/voice-orb";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewLanyardBadge({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="items-start pt-0">
      <LanyardBadge autoplay />
    </Stage>
  );
}

export function PreviewGlassLens({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage>
      {compact ? <GlassLens autoplay width={400} height={260} size={130} /> : <GlassLens autoplay />}
    </Stage>
  );
}

export function PreviewAsciiWake({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage>
      <div className="w-full max-w-[560px]">
        <AsciiWake autoplay height={compact ? 220 : 300} />
      </div>
    </Stage>
  );
}

export function PreviewLiquidDial({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <LiquidDial autoplay />
    </Stage>
  );
}

export function PreviewVoiceOrb({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <VoiceOrb autoplay />
    </Stage>
  );
}
