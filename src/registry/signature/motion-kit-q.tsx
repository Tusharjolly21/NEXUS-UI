"use client";

/**
 * Motion Kit previews (set Q): pulse monitor, spend donut. Every component ships an `autoplay` mode that
 * demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { PulseMonitor } from "@/components/pulse-monitor";
import { SpendDonut } from "@/components/spend-donut";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewPulseMonitor({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className={compact ? "p-3" : "p-8"}>
      <PulseMonitor autoplay />
    </Stage>
  );
}

export function PreviewSpendDonut({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className={compact ? "p-3" : "p-8"}>
      <SpendDonut autoplay />
    </Stage>
  );
}
