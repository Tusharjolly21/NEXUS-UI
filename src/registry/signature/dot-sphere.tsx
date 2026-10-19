"use client";

import { DotSphere } from "@/components/dot-sphere";
import { DemoCursor, type DemoStep } from "@/registry/signature/demo-cursor";

const SCRIPT: DemoStep[] = [
  { x: 0.2, y: 0.3, ms: 600, wait: 200 },
  { x: 0.62, y: 0.42, ms: 1300, wait: 200 },
  { x: 0.42, y: 0.66, ms: 1000, wait: 250 },
  { x: 0.4, y: 0.5, ms: 500, wait: 150, action: "down" },
  { x: 0.7, y: 0.5, ms: 420, action: "up", wait: 1600 },
  { x: 0.84, y: 0.8, ms: 800, wait: 300 },
];

export function PreviewDotSphere({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6">
      <DotSphere radius={compact ? 112 : 128} dots={compact ? 380 : 440} />
      <DemoCursor script={SCRIPT} />
    </div>
  );
}
