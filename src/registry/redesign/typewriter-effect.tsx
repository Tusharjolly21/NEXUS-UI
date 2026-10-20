"use client";

import { TypewriterEffect } from "@/components/typewriter-effect";

const QUERIES = ["quarterly report", "flights to Lisbon", "invoices from March", "design review notes"];

export function PreviewTypewriterEffectRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[460px] flex-col items-center gap-7 text-center">
        <h2 className={`m-0 font-semibold leading-[1.08] tracking-[-0.035em] ${compact ? "text-[34px]" : "text-[44px]"}`}>
          Made for
          <br />
          <TypewriterEffect
            text={["designers.", "engineers.", "founders.", "everyone."]}
            autoplay
            typingSpeed={70}
            deletingSpeed={34}
            pauseDuration={1300}
            className="text-[#0071e3] dark:text-[#0a84ff]"
          />
        </h2>
        {compact ? null : (
          <div className="flex h-12 w-full max-w-[340px] items-center gap-2.5 rounded-full bg-white px-4 text-left text-[15px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" className="shrink-0 text-[#86868b] dark:text-[#a1a1a6]">
              <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m13 13 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="block min-w-0 flex-1 truncate text-[#6e6e73] dark:text-[#a1a1a6]">
              Search{" "}
              <TypewriterEffect text={QUERIES} autoplay delay={900} typingSpeed={55} deletingSpeed={26} pauseDuration={1600} cursorClassName="bg-[#0071e3] dark:bg-[#0a84ff]" className="text-[#1d1d1f] dark:text-[#f5f5f7]" />
            </span>
          </div>
        )}
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Types, waits, deletes. Click to let it finish.</span>
      </div>
    </div>
  );
}
