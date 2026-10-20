"use client";

import { FeatureToolsCard } from "@/components/feature-tools-card";

export function PreviewFeatureToolsCardRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <FeatureToolsCard autoplay description={compact ? "Synced the moment anything changes." : undefined} />
    </div>
  );
}
