"use client";

/**
 * Motion Kit previews (set S): usage stack, cloth banner. Both run a physics loop (matter-js and a canvas
 * verlet cloth), so they are loaded lazily to keep the physics code out of the shared previews bundle.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over.
 */

import * as React from "react";
import type { ReactNode } from "react";

const UsageStack = React.lazy(() => import("@/components/usage-stack").then((m) => ({ default: m.UsageStack })));
const ClothBanner = React.lazy(() => import("@/components/cloth-banner").then((m) => ({ default: m.ClothBanner })));

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewUsageStack({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className={compact ? "p-3" : "p-8"}>
      <React.Suspense fallback={null}>
        <UsageStack autoplay />
      </React.Suspense>
    </Stage>
  );
}

export function PreviewClothBanner({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className={compact ? "p-3" : "p-8"}>
      <React.Suspense fallback={null}>
        <ClothBanner autoplay />
      </React.Suspense>
    </Stage>
  );
}
