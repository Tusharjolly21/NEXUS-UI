"use client";

import { GlowingCardsLayout } from "./GlowingCardsLayout";

/** Full demo section used on the live demo page. */
export function GlowingEffectCardsDemo() {
  return (
    <section className="mx-auto max-w-5xl space-y-8 px-4 py-14 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[12px] font-semibold text-[#0071e3] dark:text-[#0a84ff]">Cards</p>
        <h2 className="mt-2 text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[44px]">Glowing Effect Cards</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">
          A hairline rim that lights on the side nearest your pointer and hands the light from card to card.
        </p>
      </div>
      <GlowingCardsLayout autoplay />
    </section>
  );
}
