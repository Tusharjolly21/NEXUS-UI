"use client";

import { AtsBentoGrid } from "@/components/blocks/ats-bento-grid";

export function AtsBentoGridHeroCustomizer() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f5f5f7] dark:bg-black">
      <div className="h-full overflow-y-auto overscroll-contain [scrollbar-width:thin]">
        <AtsBentoGrid className="min-h-full" />
      </div>
    </div>
  );
}
