"use client";

/**
 * Motion Kit previews (set I): mood wheel, swipe stack, flight tracker and matrix loaders.
 * Every component ships an `autoplay` mode (the loaders simply loop), so the previews only
 * add the stage around them.
 */

import type { ReactNode } from "react";
import { MoodWheel } from "@/components/mood-wheel";
import { SwipeStack } from "@/components/swipe-stack";
import { FlightTracker } from "@/components/flight-tracker";
import { MatrixLoaders } from "@/components/matrix-loaders";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewMoodWheel({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <MoodWheel autoplay />
    </Stage>
  );
}

export function PreviewSwipeStack({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SwipeStack autoplay />
    </Stage>
  );
}

export function PreviewFlightTracker({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <FlightTracker autoplay />
    </Stage>
  );
}

export function PreviewMatrixLoaders({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage>
      <MatrixLoaders size={compact ? 52 : 64} />
    </Stage>
  );
}
