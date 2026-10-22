"use client";

/**
 * Motion Kit previews, batch W: the lenticular event pass and the origami pricing card.
 * Both components play themselves with `autoplay`, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { LenticularPass } from "@/components/lenticular-pass";
import { OrigamiPricing } from "@/components/origami-pricing";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewLenticularPass({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <LenticularPass autoplay />
    </Stage>
  );
}

export function PreviewOrigamiPricing({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <OrigamiPricing autoplay />
    </Stage>
  );
}
