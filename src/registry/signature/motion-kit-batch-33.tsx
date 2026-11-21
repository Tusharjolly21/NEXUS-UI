"use client";

/**
 * Motion Kit previews (batch 33): Typing Indicator, Status Cards, Skeleton Loader.
 * Each plays its own demo until the visitor touches it, so the previews only add a light stage around them.
 */

import type { ReactNode } from "react";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { StatusCards } from "@/components/status-cards";
import { TypingIndicator } from "@/components/typing-indicator";

function Stage({ compact, width = 560, children }: { compact: boolean; width?: number; children: ReactNode }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 dark:bg-black sm:p-6 ${compact ? "min-h-[300px]" : "min-h-[420px]"}`}>
      <div className="w-full" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

export function PreviewTypingIndicator({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <div className="flex justify-center">
        <TypingIndicator autoplay />
      </div>
    </Stage>
  );
}

export function PreviewStatusCards({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={760}>
      <StatusCards autoplay />
    </Stage>
  );
}

export function PreviewSkeletonLoader({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <div className="rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] sm:p-6">
        <SkeletonLoader autoplay />
      </div>
    </Stage>
  );
}
