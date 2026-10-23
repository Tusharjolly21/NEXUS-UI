"use client";

/**
 * Cubes Grid previews. The field fills its stage, so each preview is a rounded, clipped box with the
 * grid behind a short caption. `idleRipples` is on by default, so both stages ripple on their own
 * until a pointer moves over the page.
 */

import { CubesGrid } from "@/components/cubes-grid";

export function PreviewCubesGrid({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden bg-[#f5f5f4] dark:bg-[#f5f5f4]">
      <CubesGrid variant="isometric" autoplay />
      <div className="pointer-events-none relative flex h-full min-h-[420px] items-end justify-center p-6 pb-8">
        <p className="rounded-full bg-white/80 px-4 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] backdrop-blur">
          Move across the floor
        </p>
      </div>
    </div>
  );
}

export function PreviewCubesGridPerspective({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden bg-[#0b0b0d]">
      <CubesGrid variant="perspective" autoplay />
      <div className="pointer-events-none relative flex h-full min-h-[420px] items-end justify-center p-6 pb-8">
        <p className="rounded-full bg-black/60 px-4 py-1.5 text-[13px] font-medium text-[#f5f5f7] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur">
          Same field, tilted
        </p>
      </div>
    </div>
  );
}
