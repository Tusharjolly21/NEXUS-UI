"use client";

import { SlideToConfirm } from "@/components/slide-to-confirm";

export function PreviewSlideToConfirmRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-4 p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <SlideToConfirm
        label="Slide to pay $24.00"
        successLabel="Paid"
        pendingLabel="Paying"
        size={compact ? "sm" : "md"}
        onConfirm={() => new Promise<void>((resolve) => setTimeout(resolve, 900))}
        autoplay
      />
      <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">Drag the knob to the end, or hold Enter.</span>
    </div>
  );
}
