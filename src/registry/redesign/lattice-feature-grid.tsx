"use client";

import { LatticeFeatures } from "@/components/lattice-feature-grid";

export function PreviewLatticeFeatureGridRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <LatticeFeatures autoplay heading={compact ? "" : undefined} className={compact ? "max-w-[760px]" : "max-w-[900px]"} />
    </div>
  );
}
