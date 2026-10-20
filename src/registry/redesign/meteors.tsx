"use client";

import { Meteors } from "@/components/meteors";

export function PreviewMeteorsRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <Meteors
        autoplay
        number={compact ? 14 : 20}
        stars={compact ? 50 : 70}
        className="flex h-[320px] w-full max-w-[520px] cursor-crosshair items-center justify-center rounded-[24px] bg-[radial-gradient(120%_90%_at_50%_0%,#13204a_0%,#060a18_55%,#03050c_100%)] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]"
      >
        <div className="pointer-events-none px-6 text-center text-white">
          <h3 className="text-[40px] font-semibold leading-none tracking-[-0.045em]">Make a wish.</h3>
          <p className="mt-3 text-[13px] text-white/65">Click the sky to call one down.</p>
        </div>
      </Meteors>
    </div>
  );
}
