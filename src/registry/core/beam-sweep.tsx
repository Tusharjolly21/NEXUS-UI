"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { BeamField } from "@/components/beam-sweep-field";

export function PreviewBeamSweep() {
  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center p-6">
      <BeamField className="max-w-[960px]" />
    </div>
  );
}
