"use client";

import { GlowButton } from "@/components/glow-button";

export function PreviewGlowButtonRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-5 p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <GlowButton href="#preview" innerClassName={compact ? undefined : "px-7 py-3.5 text-[16px]"} autoplay>
        Get started
      </GlowButton>
      <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">Point at it. The light on the rim turns to face you.</span>
    </div>
  );
}
