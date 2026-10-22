"use client";

/**
 * Motion Kit previews (batch T): Vinyl Player and Ferrofluid Record.
 * Both components ship an `autoplay` mode that demonstrates itself until someone takes over.
 */

import type { ReactNode } from "react";
import { VinylPlayer } from "@/components/vinyl-player";
import { FerrofluidRecord } from "@/components/ferrofluid-record";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewVinylPlayer({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <VinylPlayer autoplay />
    </Stage>
  );
}

export function PreviewFerrofluidRecord({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <FerrofluidRecord autoplay />
    </Stage>
  );
}
