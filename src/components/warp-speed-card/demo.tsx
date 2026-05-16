"use client";

import { WarpSpeedCard, WarpTextTrigger } from "./warp-speed-card";

export function WarpSpeedCardDemo() {
  return (
    <div className="flex min-h-64 items-center justify-center p-8">
      <WarpSpeedCard className="w-full max-w-xl border border-gray-200 shadow-sm">
        <div className="px-10 py-14 text-center">
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-gray-950 sm:text-5xl">
            Build amazing websites
            <br />
            at <WarpTextTrigger>warp speed</WarpTextTrigger>
          </h2>
        </div>
      </WarpSpeedCard>
    </div>
  );
}
