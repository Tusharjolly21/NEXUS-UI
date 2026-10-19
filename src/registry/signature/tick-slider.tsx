"use client";

import { TickSlider } from "@/components/tick-slider";
import { DemoCursor, type DemoStep } from "@/registry/signature/demo-cursor";

// fractions of the wrapper box around the slider (track ≈ first 80% of the width)
const SCRIPT: DemoStep[] = [
  { x: 0.42, y: 0.6, ms: 700, wait: 200 },
  { action: "down", wait: 120 },
  { x: 0.72, ms: 900, wait: 80 },
  { x: 0.22, ms: 1100, wait: 80 },
  { x: 0.5, ms: 700, wait: 120 },
  { action: "up", wait: 400 },
  { x: 0.62, y: 0.9, ms: 600 },
];

export function PreviewTickSlider({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6">
      <div className="relative px-2 py-3">
        <TickSlider defaultValue={50} size={compact ? "md" : "lg"} />
        <DemoCursor script={SCRIPT} />
      </div>
    </div>
  );
}
