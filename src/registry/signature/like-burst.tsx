"use client";

import { LikeBurst } from "@/components/like-burst";
import { DemoCursor } from "@/registry/signature/demo-cursor";

const SCRIPT = [
  { x: 0.5, y: 0.5, ms: 700, wait: 250, action: "click" as const },
  { x: 0.56, y: 0.62, ms: 500, wait: 1600 },
  { x: 0.5, y: 0.5, ms: 450, wait: 250, action: "click" as const },
  { x: 0.6, y: 0.7, ms: 500, wait: 700 },
];

export function PreviewLikeBurst({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6">
      <LikeBurst defaultCount={1299} size={compact ? "md" : "lg"} />
      <DemoCursor script={SCRIPT} color="#ff3b5c" />
    </div>
  );
}
