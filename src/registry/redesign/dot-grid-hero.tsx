"use client";

import { DotGridHero } from "@/components/dot-grid-hero";

export function PreviewDotGridHeroRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <DotGridHero
        autoplay
        className={`w-full max-w-[960px] rounded-[24px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)] ${compact ? "min-h-[400px]" : "min-h-[440px]"}`}
      />
    </div>
  );
}
