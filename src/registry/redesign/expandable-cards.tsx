"use client";

import { ExpandableCards } from "@/components/expandable-cards";

export function PreviewExpandableCardsRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <ExpandableCards autoplay className={compact ? "max-w-[540px]" : "max-w-[580px]"} />
    </div>
  );
}
