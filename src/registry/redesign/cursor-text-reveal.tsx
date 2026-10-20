"use client";

import { CursorTextReveal } from "@/components/cursor-text-reveal";

export function PreviewCursorTextRevealRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[520px] flex-col items-center gap-3">
        <CursorTextReveal
          autoplay
          baseText="The first rule of motion is clarity."
          revealText="The second rule is feeling."
          maskSize={compact ? 78 : 92}
          fontSize={compact ? "32px" : "40px"}
          containerClassName="min-h-[260px] sm:min-h-[280px]"
        />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Move to drag the ink. Press and hold to flood it.</span>
      </div>
    </div>
  );
}

export function PreviewCursorTextRevealImageRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[520px] flex-col items-center gap-3">
        <CursorTextReveal
          autoplay
          mode="image"
          baseText="We chase moments to feel alive."
          revealText="We keep the ones we usually miss."
          maskSize={compact ? 84 : 100}
          fontSize={compact ? "30px" : "38px"}
          containerClassName="min-h-[260px] sm:min-h-[280px]"
        />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Image mode: pass revealImage, or keep the built-in gradient.</span>
      </div>
    </div>
  );
}
