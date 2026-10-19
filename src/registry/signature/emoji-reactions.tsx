"use client";

import { EmojiReactions } from "@/components/emoji-reactions";
import { DemoCursor, type DemoStep } from "@/registry/signature/demo-cursor";

// Fractions of the padded box around the component (≈352×162): chip row at 66%, picker (opens below) at 94%.
const SCRIPT: DemoStep[] = [
  { x: 0.186, y: 0.66, ms: 800, wait: 900, action: "click" },
  { x: 0.489, y: 0.66, ms: 650, wait: 450, action: "click" },
  { x: 0.15, y: 0.94, ms: 520, wait: 160 },
  { x: 0.258, y: 0.94, ms: 260, wait: 160 },
  { x: 0.366, y: 0.94, ms: 260, wait: 380, action: "click" },
  { x: 0.62, y: 0.4, ms: 500, wait: 1500 },
  { x: 0.489, y: 0.66, ms: 450, wait: 500, action: "click" },
  { x: 0.186, y: 0.66, ms: 600, wait: 600, action: "click" },
  { x: 0.62, y: 0.98, ms: 600, wait: 300 },
];

export function PreviewEmojiReactions({ compact = true }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6">
      {/* the demo cursor is placed relative to this padded box, so it stays on target at any tile size */}
      <div className="relative p-10">
        <EmojiReactions />
        <DemoCursor script={SCRIPT} />
      </div>
    </div>
  );
}
