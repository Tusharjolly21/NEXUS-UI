"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { MotionLayerScroller } from "@/components/motion-layer-scroller";

export function PreviewMotionLayerScroller() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <div className="lf-grid absolute inset-0 opacity-30" />
      <MotionLayerScroller scrollHeight={400} showGrid={false} layers={[]} />
    </div>
  );
}
