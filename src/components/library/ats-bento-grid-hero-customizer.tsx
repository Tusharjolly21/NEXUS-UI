"use client";

import { AtsBentoGrid } from "@/components/blocks/ats-bento-grid";

export function AtsBentoGridHeroCustomizer() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-50">
      <AtsBentoGrid className="h-full min-h-full" />
    </div>
  );
}
