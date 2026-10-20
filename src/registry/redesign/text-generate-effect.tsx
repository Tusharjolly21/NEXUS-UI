"use client";

import { TextGenerateEffect } from "@/components/text-generate-effect";

function Spark() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M8 1.5 9.6 6.4 14.5 8 9.6 9.6 8 14.5 6.4 9.6 1.5 8 6.4 6.4Z" fill="currentColor" />
    </svg>
  );
}

export function PreviewTextGenerateEffectRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[460px] flex-col gap-3">
        <div className="rounded-[24px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-[#0071e3] dark:text-[#0a84ff]">
            <span className="grid size-6 place-items-center rounded-full bg-[#0071e3]/10 dark:bg-[#0a84ff]/15">
              <Spark />
            </span>
            Summary
          </div>
          <TextGenerateEffect
            autoplay
            stagger={compact ? 0.07 : 0.06}
            text="Revenue grew 18% this quarter, led by the new annual plan. Churn held flat and support tickets fell by a third."
            className={`m-0 ${compact ? "text-[19px]" : "text-[22px]"} font-semibold leading-[1.28] tracking-[-0.02em]`}
          />
        </div>
        <span className="text-center text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Streams in word by word. Click the text to stop the replay.</span>
      </div>
    </div>
  );
}
