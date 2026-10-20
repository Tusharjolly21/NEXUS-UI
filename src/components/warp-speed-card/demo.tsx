"use client";

import { WarpSpeedCard, WarpTextTrigger } from "./warp-speed-card";

export function WarpSpeedCardDemo() {
  return (
    <div className="flex min-h-64 items-center justify-center p-8">
      <WarpSpeedCard className="w-full max-w-xl">
        <div className="px-8 py-14 text-center">
          <h2 className="m-0 text-[40px] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-[48px]">
            Build amazing websites
            <br />
            at <WarpTextTrigger autoplay>warp speed</WarpTextTrigger>
          </h2>
        </div>
      </WarpSpeedCard>
    </div>
  );
}
