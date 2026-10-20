"use client";

import { SquigglyDrinksHeadline, SquigglyText } from "./squiggly-text";

/** Full-page demo used by /demos/squiggly-text. */
export function SquigglyTextDemo() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-14">
      <section className="flex flex-col items-center gap-4 rounded-[24px] bg-white px-6 py-16 text-center shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <SquigglyDrinksHeadline autoplay />
        <p className="m-0 text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Sweep the pointer across the blue words to stir the ink.</p>
      </section>
      <section className="grid gap-6 sm:grid-cols-2">
        {[
          { label: "Gentle", scale: [2, 3] as const, steps: 4, stepDuration: 140 },
          { label: "Lively", scale: [6, 8] as const, steps: 6, stepDuration: 70 },
        ].map((v) => (
          <div key={v.label} className="flex flex-col items-center gap-3 rounded-[22px] bg-white px-6 py-10 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
            <SquigglyText
              text="Sketched, not printed."
              scale={v.scale}
              steps={v.steps}
              stepDuration={v.stepDuration}
              underline
              textClassName="text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]"
            />
            <span className="text-[12px] text-[#86868b] dark:text-[#a1a1a6]">{v.label}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
