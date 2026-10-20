"use client";

import { BackgroundGradient } from "./background-gradient";

/** Standalone demo page: a plan card and a button, both wrapped in the ring. */
export function BackgroundGradientDemo() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-10 px-4 py-16 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <BackgroundGradient className="w-full max-w-[340px]" containerClassName="p-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6e6e73] dark:text-[#a1a1a6]">Pro</p>
        <p className="mt-2 text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
          $18<span className="text-[15px] font-medium tracking-normal text-[#6e6e73] dark:text-[#a1a1a6]"> / month</span>
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">Unlimited projects, team seats and priority builds.</p>
      </BackgroundGradient>
      <BackgroundGradient as="button" borderRadius="999px" containerClassName="px-6 py-3 text-[15px] font-semibold">
        Upgrade now
      </BackgroundGradient>
    </section>
  );
}
