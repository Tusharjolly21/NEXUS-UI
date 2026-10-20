"use client";

import { TypewriterEffect } from "./typewriter-effect";

const card =
  "rounded-[24px] bg-white p-8 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]";

/** Full-page demo used by /demos/typewriter-effect. */
export function TypewriterEffectDemo() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-14 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className={card}>
        <h2 className="m-0 text-[40px] font-semibold leading-[1.1] tracking-[-0.035em]">
          Made for{" "}
          <TypewriterEffect
            text={["designers.", "engineers.", "founders.", "everyone."]}
            loop
            className="text-[#0071e3] dark:text-[#0a84ff]"
          />
        </h2>
      </div>
      <div className={card}>
        <TypewriterEffect
          as="p"
          text="One phrase, typed once, with a caret that keeps blinking when it is done."
          typingSpeed={38}
          className="m-0 text-[20px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]"
        />
      </div>
    </section>
  );
}
