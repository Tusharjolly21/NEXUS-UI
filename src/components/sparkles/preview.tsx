"use client";

import { Sparkles } from "./sparkles";

/** Standalone demo page: a sparkle band under a headline, and a clickable sparkle card. */
export function SparklesPreview() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="relative overflow-hidden rounded-[24px] bg-white px-6 py-16 text-center shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <h2 className="text-[56px] font-semibold leading-none tracking-[-0.05em]">Sparkles</h2>
        <div className="relative mx-auto mt-4 h-28 w-full max-w-[22rem]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0a84ff] to-transparent" />
          <Sparkles background count={120} density="high" maxSize={1.8} direction="down" className="[mask-image:radial-gradient(60%_90%_at_50%_0%,#000,transparent)]" />
        </div>
      </div>
      <div className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-[#0b0b12] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <Sparkles background interactive count={110} color="#f5f5f7" />
        <div className="pointer-events-none relative flex min-h-[320px] flex-col items-center justify-center text-center text-white">
          <h3 className="text-[40px] font-semibold leading-none tracking-[-0.045em]">Make it shine.</h3>
          <p className="mt-3 text-[13px] text-white/65">Move to leave a trail. Click to throw a burst.</p>
        </div>
      </div>
    </section>
  );
}
