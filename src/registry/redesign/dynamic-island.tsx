"use client";

import { DynamicIsland } from "@/components/dynamic-island";

/** A lock screen to give the island somewhere to live. */
export function PreviewDynamicIslandRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="relative flex h-[300px] w-full max-w-[400px] flex-col items-center overflow-hidden rounded-[44px] bg-[linear-gradient(160deg,#cfe0ff,#efdcff_55%,#ffe0d2)] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[linear-gradient(160deg,#16203d,#22163a_55%,#2d1b19)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
        <div aria-hidden="true" className="absolute -left-10 top-24 size-56 rounded-full bg-[#5ac8fa]/30 blur-3xl dark:bg-[#0a84ff]/25" />
        <div aria-hidden="true" className="absolute -right-12 bottom-0 size-56 rounded-full bg-[#ff9f0a]/25 blur-3xl dark:bg-[#bf5af2]/25" />
        <div className="relative flex w-full items-center justify-between px-7 pt-4 text-[13px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]" aria-hidden="true">
          <span>9:41</span>
          <span className="flex items-center gap-1.5">
            <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
              <rect x="0" y="7" width="3" height="4" rx="1" />
              <rect x="4.5" y="5" width="3" height="6" rx="1" />
              <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
              <rect x="13.5" y="0" width="3" height="11" rx="1" />
            </svg>
            <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
              <rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="currentColor" opacity=".45" />
              <rect x="2" y="2" width="15" height="7" rx="1.8" fill="currentColor" />
              <path d="M22 3.8v3.4c.7-.3 1.2-1 1.2-1.7s-.5-1.4-1.2-1.7Z" fill="currentColor" opacity=".45" />
            </svg>
          </span>
        </div>
        <div className="relative mt-16 text-center" aria-hidden="true">
          <p className="m-0 text-[14px] font-medium text-[#1d1d1f]/70 dark:text-[#f5f5f7]/75">Tuesday, 20 October</p>
          <p className="m-0 text-[64px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-[#1d1d1f]/90 dark:text-[#f5f5f7]/90">9:41</p>
        </div>
        <div className="absolute inset-x-0 top-3 z-10 flex justify-center px-3">
          <DynamicIsland autoplay />
        </div>
        <p className="absolute bottom-5 m-0 text-[12px] text-[#424245] dark:text-[#c7c7cc]">{compact ? "Tap the island." : "Tap the island to open it."}</p>
      </div>
    </div>
  );
}
