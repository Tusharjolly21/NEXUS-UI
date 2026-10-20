"use client";
/** Copy of the Motion Kit Price Odometer, relabelled for TalentHub: hires instead of seats, rolling vs 12-month terms. */
import { useEffect, useRef, useState } from "react";
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

export default function HireOdometer({ monthlyRate = 15, yearlyRate = 12, maxSeats = 100, accent = "#0071e3", autoplay = false }: PriceOdometerProps) {
  const [yearly, setYearly] = useState(false);
  const [seats, setSeats] = useState(2);
  const touched = useRef(false);
  const rate = yearly ? yearlyRate : monthlyRate;
  const total = rate * seats;
  const saving = Math.round((1 - yearlyRate / monthlyRate) * 100);

  useEffect(() => {
    if (!autoplay) return;
    const seq: Array<["s", number] | ["b"]> = [["s", 4], ["b"], ["s", 1], ["s", 7], ["b"], ["s", 12], ["s", 2]];
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
    <div className="flex w-full max-w-[460px] flex-col gap-6 rounded-[28px] bg-white p-7 shadow-[0_0_0_1px_rgba(0,0,0,.04),0_24px_50px_-28px_rgba(0,0,0,.28)]" onPointerDown={touch}>
      <div className="flex items-center justify-between">
        <div role="group" aria-label="Billing period" className="relative grid w-[220px] grid-cols-2 rounded-xl bg-[#f0f0f3] p-[3px]">
          {["Rolling", "12 months"].map((l, i) => {
            const on = (i === 1) === yearly;
            return (
              <button key={l} type="button" aria-pressed={on} onClick={() => setYearly(i === 1)} className="relative z-10 h-8 rounded-[9px] text-[13px] font-medium text-[#1d1d1f] focus-visible:outline focus-visible:outline-2" style={{ outlineColor: accent }}>
                {on && <motion.span layoutId="th-odo-seg" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" />}
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
        <motion.div layout className="flex items-start text-[clamp(44px,12vw,64px)] font-semibold leading-none tracking-[-0.045em] text-[#1d1d1f] tabular-nums" role="status">
          <motion.span layout className="mr-1 mt-1 text-[30px] tracking-[-0.02em]">$</motion.span>
          <RollingNumber value={total} />
          <motion.span layout className="mb-3 ml-2.5 self-end text-[17px] font-medium tracking-[-0.01em] text-[#6e6e73]">/mo</motion.span>
        </motion.div>
        <span className="text-[14px] text-[#6e6e73]">
          ${rate.toLocaleString("en-US")} per hire per month, {yearly ? "12-month term" : "cancel any month"}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="th-odo-seats" className="text-[15px] font-medium text-[#1d1d1f]">People placed</label>
          <span className="text-[15px] font-semibold tabular-nums text-[#1d1d1f]">{seats}</span>
        </div>
        <div className="relative flex h-[26px] items-center">
          <div className="absolute inset-x-0 h-1 rounded-full bg-[#e8e8ed]" />
          <motion.div className="absolute left-0 h-1 rounded-full" style={{ background: accent }} animate={{ width: `${((seats - 1) / (maxSeats - 1)) * 100}%` }} transition={{ type: "spring", stiffness: 400, damping: 40 }} />
          <input
            id="th-odo-seats"
            type="range"
            min={1}
            max={maxSeats}
            value={seats}
            onChange={(e) => { touch(); setSeats(Number(e.target.value)); }}
            className="th-odo-range relative w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none"
          />
        </div>
      </div>
      <style>{`.th-odo-range::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 3px 10px rgba(0,0,0,.18),0 0 0 .5px rgba(0,0,0,.06);transition:transform .2s}.th-odo-range:active::-webkit-slider-thumb{transform:scale(1.12)}.th-odo-range::-moz-range-thumb{width:26px;height:26px;border:0;border-radius:50%;background:#fff;box-shadow:0 3px 10px rgba(0,0,0,.18)}.th-odo-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 3px ${accent}}`}</style>
    </div>
  );
}
