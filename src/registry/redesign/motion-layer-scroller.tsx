"use client";

import { MotionLayerScroller } from "@/components/motion-layer-scroller";

export function PreviewMotionLayerScrollerRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="w-full max-w-[560px]">
        <MotionLayerScroller autoplay scrollHeight={compact ? 320 : 360} />
      </div>
    </div>
  );
}
