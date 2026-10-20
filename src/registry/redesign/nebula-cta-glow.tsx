"use client";

import { NebulaCtaGlow } from "@/components/nebula-cta-glow";

export function PreviewNebulaCtaGlowRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[860px] flex-col items-center gap-3">
        <NebulaCtaGlow autoplay description={compact ? "" : undefined} />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Bring the pointer to the button, then press it.</span>
      </div>
    </div>
  );
}
