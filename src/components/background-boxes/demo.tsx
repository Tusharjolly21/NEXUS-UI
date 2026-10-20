"use client";

import { BackgroundBoxes } from "./background-boxes";

/** Standalone demo page: the grid behind a short headline. */
export function BackgroundBoxesDemo() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <BackgroundBoxes className="h-[520px] w-full rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#0b0b0d] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <div className="flex h-full flex-col items-center justify-center px-6 text-center text-[#1d1d1f] dark:text-[#f5f5f7]">
          <h2 className="text-[40px] font-semibold leading-none tracking-[-0.045em]">Every cell is a key.</h2>
          <p className="mt-3 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Run the pointer across the grid.</p>
        </div>
      </BackgroundBoxes>
    </section>
  );
}
