"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { LatticeFeatures } from "@/components/lattice-feature-grid";

export function PreviewFeatureGrid() {
  return (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center p-6">
      <LatticeFeatures className="max-w-[900px]" />
    </div>
  );
}
