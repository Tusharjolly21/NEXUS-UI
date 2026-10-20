"use client";

import { Sparkles } from "@/components/sparkles";

export function PreviewSparklesRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div
        className={`relative w-full max-w-[520px] cursor-crosshair overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)] ${compact ? "h-[290px]" : "h-[320px]"}`}
      >
        <Sparkles background interactive autoplay count={compact ? 60 : 80} maxSize={2.6} />
        <div className="pointer-events-none relative flex h-full flex-col items-center justify-center px-6 text-center">
          <h3 className="text-[48px] font-semibold leading-none tracking-[-0.05em]">Sparkles</h3>
          <div className="relative mt-3 h-px w-56 bg-gradient-to-r from-transparent via-[#0071e3] to-transparent dark:via-[#64d2ff]" />
          <p className="mt-4 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Move to leave a trail. Click to throw a burst.</p>
        </div>
      </div>
    </div>
  );
}
