"use client";

import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function PreviewStarfieldHeroRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <InteractiveStarfieldHero autoplay particleCount={compact ? 260 : 340} className={compact ? "min-h-[400px] w-full max-w-[960px]" : "min-h-[440px] w-full max-w-[960px]"} />
    </div>
  );
}
