"use client";

import { BackgroundGradient } from "@/components/background-gradient";

export function PreviewBackgroundGradientRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[320px] flex-col items-center gap-5">
        <BackgroundGradient autoplay className="w-full" containerClassName={compact ? "p-5" : "p-6"}>
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6e6e73] dark:text-[#a1a1a6]">Pro</p>
            <span className="rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0066cc] dark:bg-[#0a84ff]/20 dark:text-[#64b5ff]">Popular</span>
          </div>
          <p className="mt-2 text-[40px] font-semibold leading-none tracking-[-0.045em] tabular-nums">
            $18<span className="text-[15px] font-medium tracking-normal text-[#6e6e73] dark:text-[#a1a1a6]"> / month</span>
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">Unlimited projects, team seats and priority builds.</p>
        </BackgroundGradient>
        <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Hover the card. Press it.</span>
      </div>
    </div>
  );
}
