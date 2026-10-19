"use client";

/**
 * Motion Kit previews (set B): interaction studies brought over from the Motion Kit design.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over,
 * so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { SaggingField } from "@/components/sagging-field";
import { TearOffTicket } from "@/components/tear-off-ticket";
import { ThrowWheel } from "@/components/throw-wheel";
import { PixelSelect } from "@/components/pixel-select";
import { ScrubInputs } from "@/components/scrub-inputs";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewSaggingField({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className="overflow-hidden">
      <SaggingField autoplay width={compact ? 320 : 400} />
    </Stage>
  );
}

export function PreviewTearOffTicket({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="overflow-hidden">
      <TearOffTicket autoplay />
    </Stage>
  );
}

export function PreviewThrowWheel({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ThrowWheel autoplay />
    </Stage>
  );
}

export function PreviewPixelSelect({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="items-start">
      <PixelSelect autoplay />
    </Stage>
  );
}

export function PreviewScrubInputs({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ScrubInputs autoplay />
    </Stage>
  );
}
