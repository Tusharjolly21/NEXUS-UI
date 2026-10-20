"use client";

/**
 * Motion Kit previews (set R): tag pit, marble progress. Both run matter-js, so they are loaded lazily to keep
 * the physics engine out of the shared previews bundle. Each ships an `autoplay` mode that demonstrates itself
 * until someone takes over, so the previews only add the stage around them.
 */

import { lazy, Suspense, type ReactNode } from "react";

const TagPit = lazy(() => import("@/components/tag-pit").then((m) => ({ default: m.TagPit })));
const MarbleProgress = lazy(() => import("@/components/marble-progress").then((m) => ({ default: m.MarbleProgress })));

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewTagPit({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className={compact ? "p-3" : "p-8"}>
      <Suspense fallback={null}>
        <TagPit autoplay />
      </Suspense>
    </Stage>
  );
}

export function PreviewMarbleProgress({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className={compact ? "p-3" : "p-8"}>
      <Suspense fallback={null}>
        <MarbleProgress autoplay />
      </Suspense>
    </Stage>
  );
}
