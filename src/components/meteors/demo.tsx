"use client";

import { Meteors } from "./meteors";

/** Standalone demo page: a night-sky card with meteors behind the copy. */
export function MeteorsDemo() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <Meteors
        number={22}
        stars={70}
        className="flex min-h-[420px] items-center justify-center rounded-[24px] bg-[radial-gradient(120%_90%_at_50%_0%,#13204a_0%,#060a18_55%,#03050c_100%)] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
      >
        <div className="px-6 text-center text-white">
          <h2 className="text-[40px] font-semibold leading-none tracking-[-0.045em]">Make a wish.</h2>
          <p className="mt-3 text-[13px] text-white/60">Click the sky to call one down.</p>
        </div>
      </Meteors>
    </section>
  );
}
