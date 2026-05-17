"use client";

import SpotlightBentoGrid from "@/components/blocks/spotlight-bento-grid";

export function SpotlightBentoGridCustomizer() {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-zinc-950">
      <div className="w-full max-w-3xl">
        <SpotlightBentoGrid />
      </div>
    </div>
  );
}
