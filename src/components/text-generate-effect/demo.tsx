"use client";

import { TextGenerateEffect } from "./text-generate-effect";

const card =
  "rounded-[24px] bg-white p-8 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]";

/** Full-page demo used by /demos/text-generate-effect. */
export function TextGenerateEffectDemo() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-14 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className={card}>
        <TextGenerateEffect
          as="h2"
          autoplay
          text="Build interfaces that feel alive, readable and polished from the very first frame."
          className="m-0 text-[34px] font-semibold leading-[1.12] tracking-[-0.03em]"
        />
      </div>
      <div className={card}>
        <TextGenerateEffect
          mode="character"
          stagger={0.018}
          trigger="viewport"
          text="Character mode streams one letter at a time without ever breaking a word."
          className="m-0 text-[20px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]"
        />
      </div>
      <div className={card}>
        <TextGenerateEffect
          mode="line"
          stagger={0.3}
          trigger="viewport"
          text={"Built for speed.\nDesigned to last.\nShips on Friday."}
          className="m-0 text-[28px] font-semibold leading-[1.2] tracking-[-0.03em]"
        />
      </div>
    </section>
  );
}
