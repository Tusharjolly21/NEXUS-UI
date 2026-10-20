"use client";

/**
 * Motion Kit previews (set L): hop labels, step player, pull to refresh and the runaway button.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over,
 * so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { HopLabels } from "@/components/hop-labels";
import { StepPlayer } from "@/components/step-player";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { RunawayButton } from "@/components/runaway-button";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewHopLabels({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <HopLabels autoplay />
    </Stage>
  );
}

export function PreviewStepPlayer({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <StepPlayer autoplay />
    </Stage>
  );
}

export function PreviewPullToRefresh({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <PullToRefresh autoplay />
    </Stage>
  );
}

export function PreviewRunawayButton({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <RunawayButton autoplay />
    </Stage>
  );
}
