"use client";

import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";

const stage = "relative flex h-full min-h-[360px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]";
const card =
  "w-full max-w-[860px] overflow-hidden rounded-[24px] bg-[#fbfbfd] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#111113] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]";

export function PreviewCinematicLogoCloudRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={stage}>
      <div className="flex w-full max-w-[860px] flex-col items-center gap-3">
        <div className={card}>
          <CinematicLogoCloud autoplay className="py-8" eyebrow="Trusted by teams building what's next" description={compact ? undefined : "From first prototype to production."} />
        </div>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Sweep the pointer across the logos.</span>
      </div>
    </div>
  );
}

export function PreviewCinematicLogoCloudMarqueeRedesign() {
  return (
    <div className={stage}>
      <div className="flex w-full max-w-[860px] flex-col items-center gap-3">
        <div className={card}>
          <CinematicLogoCloud variant="marquee-named" eyebrow="Used by teams everywhere" className="py-8" />
        </div>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Hover to slow it, or drag and fling.</span>
      </div>
    </div>
  );
}
