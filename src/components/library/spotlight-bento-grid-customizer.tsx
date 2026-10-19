"use client";

import SpotlightBentoGrid from "@/components/blocks/spotlight-bento-grid";

export function SpotlightBentoGridCustomizer() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f5f5f7] dark:bg-black">
      <div className="flex h-full overflow-y-auto overscroll-contain [scrollbar-width:thin]">
        <SpotlightBentoGrid className="my-auto" />
      </div>
    </div>
  );
}
