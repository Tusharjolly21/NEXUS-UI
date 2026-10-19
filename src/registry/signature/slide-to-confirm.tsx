"use client";

import { SlideToConfirm } from "@/components/slide-to-confirm";
import { DemoCursor, type DemoStep } from "@/registry/signature/demo-cursor";

// fractions of the padded wrapper around the track: knob starts at x≈0.12
const SCRIPT: DemoStep[] = [
  { x: 0.13, y: 0.55, ms: 800, wait: 250 },
  { action: "down", wait: 160 },
  { x: 0.42, ms: 600, wait: 60 },
  { x: 0.9, ms: 700, wait: 120 },
  { action: "up", wait: 3600 },
  { x: 0.7, y: 1.1, ms: 600 },
];

const pay = () => new Promise<void>((resolve) => setTimeout(resolve, 900));

export function PreviewSlideToConfirm({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6">
      <div className="relative p-3">
        <SlideToConfirm label="Slide to pay $24" successLabel="Paid" pendingLabel="Paying" onConfirm={pay} resetAfter={1800} />
        <DemoCursor script={SCRIPT} />
      </div>
    </div>
  );
}
