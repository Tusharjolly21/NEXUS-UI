"use client";

import { ShootingStarsGrid } from "@/components/shooting-stars-grid";

export function PreviewShootingStarsGridRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <ShootingStarsGrid autoplay shootingStarCount={7} className={compact ? "min-h-[400px] max-w-[960px]" : "min-h-[440px] max-w-[960px]"} />
    </div>
  );
}
