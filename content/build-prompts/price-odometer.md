# Price Odometer

Add the "Price Odometer" component from Nexus UI to my project.

A seat-based pricing card whose total rolls like an odometer: each digit spins on its own spring, columns slide in as the number grows, and a Save badge pops in for yearly billing.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { PriceOdometer, RollingNumber } from "@/components/price-odometer";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/price-odometer/index.ts ---

```ts
export { PriceOdometer, RollingNumber } from "./price-odometer";
export type { PriceOdometerProps } from "./price-odometer";
```

--- components/price-odometer/price-odometer.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface PriceOdometerProps {
  monthlyRate?: number;
  yearlyRate?: number;
  maxSeats?: number;
  accent?: string;
  /** Changes seats and billing by itself until the user interacts. */
  autoplay?: boolean;
}

const roll = { type: "spring", stiffness: 160, damping: 19, mass: 1.1 } as const;

function Digit({ value, delay }: { value: number; delay: number }) {
  return (
    <span
      className="relative inline-block h-[1em] w-[0.6em] overflow-hidden"
      style={{ maskImage: "linear-gradient(180deg,transparent,#000 16%,#000 84%,transparent)", WebkitMaskImage: "linear-gradient(180deg,transparent,#000 16%,#000 84%,transparent)" }}
    >
      <motion.span className="absolute left-0 top-0 flex w-full flex-col" initial={false} animate={{ y: `${-value}em` }} transition={{ ...roll, delay }}>
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block h-[1em] text-center">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function RollingNumber({ value }: { value: number }) {
  const chars = value.toLocaleString("en-US").split("");
  // Key from the right so existing columns keep their identity as the number grows.
  return (
    <span className="inline-flex" aria-label={value.toLocaleString("en-US")}>
      <AnimatePresence initial={false} mode="popLayout">
        {chars.map((c, i) => {
          const fromRight = chars.length - i;
          return (
            <motion.span
              key={`p${fromRight}${c === "," ? "c" : "d"}`}
              layout
              initial={{ opacity: 0, width: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }}
              exit={{ opacity: 0, width: 0, filter: "blur(6px)" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="inline-flex overflow-hidden"
              aria-hidden="true"
            >
              {c === "," ? <span className="w-[0.28em]">,</span> : <Digit value={Number(c)} delay={(fromRight - 1) * 0.04} />}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </span>
  );
}

export function PriceOdometer({ monthlyRate = 15, yearlyRate = 12, maxSeats = 100, accent = "#0071e3", autoplay = false }: PriceOdometerProps) {
  const uid = useId();
  const [yearly, setYearly] = useState(false);
  const [seats, setSeats] = useState(8);
  const touched = useRef(false);
  const rate = yearly ? yearlyRate : monthlyRate;
  const total = rate * seats;
  const saving = Math.round((1 - yearlyRate / monthlyRate) * 100);

  useEffect(() => {
    if (!autoplay) return;
    const seq: Array<["s", number] | ["b"]> = [["s", 24], ["b"], ["s", 3], ["s", 67], ["b"], ["s", 100], ["s", 12]];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      const step = seq[k++ % seq.length];
      if (step[0] === "b") setYearly((y) => !y);
      else setSeats(step[1]);
    }, 1900);
    return () => clearInterval(t);
  }, [autoplay]);

  const touch = () => (touched.current = true);

  return (
    <div className="flex w-full max-w-[460px] flex-col gap-6 rounded-[28px] bg-white p-7 shadow-[0_0_0_1px_rgba(0,0,0,.04),0_24px_50px_-28px_rgba(0,0,0,.28)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-28px_rgba(0,0,0,.6)]" onPointerDown={touch}>
      <div className="flex items-center justify-between">
        <div role="group" aria-label="Billing period" className="relative grid w-[220px] grid-cols-2 rounded-xl bg-[#f0f0f3] p-[3px] dark:bg-[#3a3a3c]">
          {["Monthly", "Yearly"].map((l, i) => {
            const on = (i === 1) === yearly;
            return (
              <button key={l} type="button" aria-pressed={on} onClick={() => setYearly(i === 1)} className="relative z-10 h-8 rounded-[9px] text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] focus-visible:outline focus-visible:outline-2" style={{ outlineColor: accent }}>
                {on && <motion.span layoutId={`${uid}-seg`} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white dark:bg-[#636366] shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" />}
                {l}
              </button>
            );
          })}
        </div>
        <AnimatePresence>
          {yearly && (
            <motion.span
              initial={{ scale: 0.4, rotate: -14, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
              className="rounded-full px-2.5 py-1.5 text-[12px] font-semibold"
              style={{ color: accent, background: `${accent}1f` }}
            >
              Save {saving}%
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-1">
        <motion.div layout className="flex items-start text-[84px] font-semibold leading-none tracking-[-0.045em] text-[#1d1d1f] tabular-nums dark:text-[#f5f5f7]" role="status">
          <motion.span layout className="mr-1 mt-2 text-[40px] tracking-[-0.02em]">$</motion.span>
          <RollingNumber value={total} />
          <motion.span layout className="mb-3 ml-2.5 self-end text-[17px] font-medium tracking-[-0.01em] text-[#86868b] dark:text-[#98989d]">/mo</motion.span>
        </motion.div>
        <span className="text-[14px] text-[#86868b] dark:text-[#98989d]">
          ${rate} per seat, billed {yearly ? "yearly" : "monthly"}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor={`${uid}-seats`} className="text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Seats</label>
          <span className="text-[15px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{seats}</span>
        </div>
        <div className="relative flex h-[26px] items-center">
          <div className="absolute inset-x-0 h-1 rounded-full bg-[#e8e8ed] dark:bg-[#48484a]" />
          <motion.div className="absolute left-0 h-1 rounded-full" style={{ background: accent }} animate={{ width: `${((seats - 1) / (maxSeats - 1)) * 100}%` }} transition={{ type: "spring", stiffness: 400, damping: 40 }} />
          <input
            id={`${uid}-seats`}
            type="range"
            min={1}
            max={maxSeats}
            value={seats}
            onChange={(e) => { touch(); setSeats(Number(e.target.value)); }}
            className="odo-range relative w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none"
          />
        </div>
      </div>
      <style>{`.odo-range::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 3px 10px rgba(0,0,0,.18),0 0 0 .5px rgba(0,0,0,.06);transition:transform .2s}.odo-range:active::-webkit-slider-thumb{transform:scale(1.12)}.odo-range::-moz-range-thumb{width:26px;height:26px;border:0;border-radius:50%;background:#fff;box-shadow:0 3px 10px rgba(0,0,0,.18)}.odo-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 3px ${accent}}`}</style>
    </div>
  );
}
```
