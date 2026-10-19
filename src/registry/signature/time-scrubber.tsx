"use client";

import { TimeScrubber } from "@/components/time-scrubber";
import { DemoCursor, type DemoStep } from "@/registry/signature/demo-cursor";

// fractions of the card box: the ruler sits in the lower half
const SCRIPT: DemoStep[] = [
  { x: 0.62, y: 0.72, ms: 700, wait: 200 },
  { action: "down", wait: 120 },
  { x: 0.3, ms: 900, wait: 60 },
  { action: "up", wait: 1300 },
  { x: 0.35, y: 0.74, ms: 500, wait: 120 },
  { action: "down", wait: 100 },
  { x: 0.7, ms: 650, wait: 30 },
  { action: "up", wait: 1200 },
  { x: 0.8, y: 0.95, ms: 600 },
];

export function PreviewTimeScrubber({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6">
      <div className="relative">
        <TimeScrubber defaultValue={9 * 60 + 30} interval={15} label="Pickup" />
        <DemoCursor script={SCRIPT} />
      </div>
    </div>
  );
}
