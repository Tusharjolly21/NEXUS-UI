"use client";

/**
 * Motion Kit previews (set C): 3D and canvas studies brought over from the Motion Kit design.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over,
 * so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { LitKeyboard } from "@/components/lit-keyboard";
import { RippleField } from "@/components/ripple-field";
import { DotGlobe } from "@/components/dot-globe";
import { ComponentLayers } from "@/components/component-layers";
import { StandingCalendar } from "@/components/standing-calendar";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewLitKeyboard({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <LitKeyboard autoplay />
    </Stage>
  );
}

export function PreviewRippleField({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage>
      <div className="w-full max-w-[560px]">
        <RippleField autoplay height={compact ? 220 : 300} />
      </div>
    </Stage>
  );
}

export function PreviewDotGlobe({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage>
      <DotGlobe autoplay size={compact ? 260 : 340} />
    </Stage>
  );
}

export function PreviewComponentLayers({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ComponentLayers autoplay />
    </Stage>
  );
}

export function PreviewStandingCalendar({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage>
      <StandingCalendar autoplay weeks={compact ? 22 : 30} />
    </Stage>
  );
}
