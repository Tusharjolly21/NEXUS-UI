"use client";

/**
 * Motion Kit previews (set H): stamps, a contact cluster, a throwable sticker and a token meter.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over,
 * so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { StampSwirl } from "@/components/stamp-swirl";
import { BubbleCluster } from "@/components/bubble-cluster";
import { StickerToss } from "@/components/sticker-toss";
import { ContextMeter } from "@/components/context-meter";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewStampSwirl({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <StampSwirl autoplay />
    </Stage>
  );
}

export function PreviewBubbleCluster({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <BubbleCluster autoplay />
    </Stage>
  );
}

export function PreviewStickerToss({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <StickerToss autoplay />
    </Stage>
  );
}

export function PreviewContextMeter({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="py-6">
      <ContextMeter autoplay />
    </Stage>
  );
}
