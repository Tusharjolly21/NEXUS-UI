"use client";

/**
 * Motion Kit previews (batch 30): Animated Accordion.
 * The card plays its own demo until the visitor touches it, so the preview only adds a light stage around it.
 */

import type { ReactNode } from "react";
import { AnimatedAccordion } from "@/components/animated-accordion";

function Stage({ compact, width = 520, children }: { compact: boolean; width?: number; children: ReactNode }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 dark:bg-black sm:p-6 ${compact ? "min-h-[300px]" : "min-h-[420px]"}`}>
      <div className="w-full [&>div]:mx-auto" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

export function PreviewAnimatedAccordion({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={520}>
      <AnimatedAccordion autoplay />
    </Stage>
  );
}
