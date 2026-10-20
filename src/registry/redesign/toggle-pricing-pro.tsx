"use client";

import { PricingToggle } from "@/components/toggle-pricing-pro";

export function PreviewTogglePricingProRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <PricingToggle autoplay className={compact ? "max-w-[600px]" : "max-w-[820px]"} />
    </div>
  );
}
