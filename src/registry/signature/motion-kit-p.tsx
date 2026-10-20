"use client";

/**
 * Motion Kit previews (set P): traffic bars, stock line. Every component ships an `autoplay` mode that
 * demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { TrafficBars } from "@/components/traffic-bars";
import { StockLine } from "@/components/stock-line";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewTrafficBars({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <TrafficBars autoplay />
    </Stage>
  );
}

export function PreviewStockLine({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <StockLine autoplay />
    </Stage>
  );
}
