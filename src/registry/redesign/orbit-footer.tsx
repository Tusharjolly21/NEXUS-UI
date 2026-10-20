"use client";

import { OrbitFooter } from "@/components/orbit-footer";

export function PreviewOrbitFooterRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[980px] flex-col items-center gap-3">
        <OrbitFooter year={2026} legal="Orbit Labs" showNewsletter={!compact} autoplay />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Run the pointer along the wordmark.</span>
      </div>
    </div>
  );
}
