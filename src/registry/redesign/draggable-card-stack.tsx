"use client";

import { DraggableCardStack } from "@/components/draggable-card-stack";

export function PreviewDraggableCardStackRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center overflow-hidden p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <DraggableCardStack autoplay cardWidth={compact ? 200 : 220} cardHeight={compact ? 268 : 296} />
    </div>
  );
}
