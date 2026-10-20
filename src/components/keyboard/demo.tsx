"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MacKeyboard } from "./keyboard";
import type { SoundType } from "./use-keyboard-sound";

const SOUNDS: { id: SoundType; label: string }[] = [
  { id: "mechanical", label: "Mechanical" },
  { id: "clicky", label: "Clicky" },
  { id: "soft", label: "Soft" },
];

/** Full-page demo used by /demos/keyboard. */
export function KeyboardDemo() {
  const [sound, setSound] = React.useState<SoundType>("mechanical");
  const [on, setOn] = React.useState(true);
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-balance text-[clamp(30px,5vw,44px)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">Type on it.</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">Every key sinks, clicks and sends a ring of backlight through the gaps.</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <div role="radiogroup" aria-label="Key sound" className="flex rounded-full bg-[#e8e8ed] p-0.5 dark:bg-[#2c2c2e]">
          {SOUNDS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={sound === s.id}
              onClick={() => setSound(s.id)}
              className="relative rounded-full px-4 py-1.5 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
            >
              {sound === s.id && <motion.span layoutId="kb-demo-sound" className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.12)] dark:bg-[#48484a]" transition={{ type: "spring", stiffness: 500, damping: 32 }} />}
              <span className={`relative ${sound === s.id ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}>{s.label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={on}
          onClick={() => setOn((v) => !v)}
          className="rounded-full bg-[#e8e8ed] px-4 py-2 text-[13px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
        >
          Sound {on ? "on" : "off"}
        </button>
      </div>
      <div className="mt-8">
        <MacKeyboard listen enableSound={on} soundType={sound} volume={0.65} />
      </div>
    </section>
  );
}
