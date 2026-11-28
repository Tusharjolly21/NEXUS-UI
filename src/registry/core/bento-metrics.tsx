"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { BentoSignals } from "@/components/bento-signal-grid";

export function PreviewBentoMetrics() {
  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center p-6">
      <BentoSignals className="max-w-[900px]" />
    </div>
  );
}
