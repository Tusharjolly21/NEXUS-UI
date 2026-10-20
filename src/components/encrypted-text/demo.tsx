"use client";

import { EncryptedText } from "./encrypted-text";

const card =
  "flex flex-col items-center gap-3 rounded-[24px] bg-white p-8 text-center shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]";

/** Full-page demo used by /demos/encrypted-text. */
export function EncryptedTextDemo() {
  return (
    <section className="mx-auto grid max-w-3xl gap-6 px-4 py-14 text-[#1d1d1f] sm:grid-cols-2 dark:text-[#f5f5f7]">
      <div className={`${card} sm:col-span-2`}>
        <EncryptedText text="ACCESS GRANTED" loop loopDelay={2400} className="text-[40px] font-semibold tracking-[0.06em]" />
        <span className="text-[12px] text-[#86868b] dark:text-[#a1a1a6]">trigger=&quot;load&quot; with loop</span>
      </div>
      <div className={card}>
        <EncryptedText text="Hover me" trigger="hover" speed={40} iterations={5} className="text-[24px] font-semibold" />
        <span className="text-[12px] text-[#86868b] dark:text-[#a1a1a6]">trigger=&quot;hover&quot;</span>
      </div>
      <div className={card}>
        <EncryptedText text="Click to decode" trigger="click" speed={35} iterations={6} className="px-1 text-[24px] font-semibold" />
        <span className="text-[12px] text-[#86868b] dark:text-[#a1a1a6]">trigger=&quot;click&quot;</span>
      </div>
    </section>
  );
}
