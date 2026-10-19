"use client";

import { CursorBuddy } from "@/components/cursor-buddy";
import { DemoCursor, type DemoStep } from "@/registry/signature/demo-cursor";

const SCRIPT: DemoStep[] = [
  { x: 0.16, y: 0.24, ms: 700, wait: 500 },
  { x: 0.86, y: 0.3, ms: 1100, wait: 450 },
  { x: 0.78, y: 0.86, ms: 800, wait: 350 },
  { x: 0.2, y: 0.82, ms: 1000, wait: 400 },
  { x: 0.5, y: 0.53, ms: 750, wait: 1100 },
  { x: 0.56, y: 0.12, ms: 700, wait: 500 },
];

export function PreviewCursorBuddy({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6">
      <div className="flex items-end gap-7">
        <CursorBuddy shape="pill" fill="dark" eyes="slits" size={compact ? 58 : 66} sleepAfter={0} />
        <CursorBuddy shape="squircle" size={compact ? 112 : 124} />
        <CursorBuddy shape="circle" fill="#ff7b42" eyes="squares" size={compact ? 62 : 70} sleepAfter={0} />
      </div>
      <DemoCursor script={SCRIPT} />
    </div>
  );
}
