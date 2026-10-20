"use client";

import { HeroAurora } from "@/components/hero-aurora-spotlight";

export function PreviewHeroAuroraSpotlightRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <HeroAurora autoplay className={compact ? "max-w-[960px] pt-10" : "max-w-[960px]"} />
    </div>
  );
}
