"use client";

import { DotSphere } from "@/components/dot-sphere";

export function PreviewDotSphereRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <DotSphere autoplay radius={compact ? 112 : 120} dots={compact ? 520 : 600} />
    </div>
  );
}
