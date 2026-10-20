"use client";
// Local copy of the Motion Kit Ruler Picker: adds an accessible label prop and a tick-label interval,
// and keeps onChange out of the state updater.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";

export interface RulerPickerProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: string;
  /** Shown before the number, e.g. "$". */
  prefix?: string;
  presets?: number[];
  accent?: string;
  onChange?: (v: number) => void;
  /** Glides between presets by itself until the user interacts. */
  autoplay?: boolean;
  /** Accessible name of the slider. */
  label?: string;
  /** Label every n-th tick. */
  labelEvery?: number;
}

const STEP = 12; // px per unit
const VIEW = 380;

export default function RulerPicker({ min = 0, max = 90, defaultValue = 25, unit = "min", prefix = "", presets = [5, 15, 30, 60], accent = "#ff9f0a", onChange, autoplay = false, label = "Value", labelEvery = 15 }: RulerPickerProps) {
  const x = useMotionValue(-(defaultValue - min) * STEP);
  const [value, setValue] = useState(defaultValue);
  const [dir, setDir] = useState(1);
  const touched = useRef(false);
  const last = useRef(defaultValue);

  // Side effects stay out of the state updater so the parent can update safely.
  useMotionValueEvent(x, "change", (v) => {
    const next = Math.max(min, Math.min(max, Math.round(-v / STEP) + min));
    if (next === last.current) return;
    setDir(next > last.current ? 1 : -1);
    last.current = next;
    setValue(next);
    onChange?.(next);
  });

  const goTo = (v: number) => animate(x, -(v - min) * STEP, { type: "spring", stiffness: 140, damping: 22 });

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const seq = [60, 5, 45, 15, 30];
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      goTo(seq[k++ % seq.length]);
    }, 2200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const ticks = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const timeUnit = unit === "min";
  const h = timeUnit ? Math.floor(value / 60) : 0;
  const m = value % 60;

  return (
    <div className="flex w-full flex-col items-center gap-6" onPointerDown={() => (touched.current = true)}>
      <div className="flex h-[64px] items-baseline gap-1 text-[56px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] tabular-nums" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.span
            key={value}
            custom={dir}
            variants={{ in: (d: number) => ({ y: d * 30, opacity: 0, filter: "blur(4px)" }), out: (d: number) => ({ y: d * -30, opacity: 0, filter: "blur(4px)" }) }}
            initial="in"
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit="out"
            transition={{ type: "spring", stiffness: 600, damping: 36 }}
          >
            {prefix}{h > 0 ? `${h}:${String(m).padStart(2, "0")}` : value}
          </motion.span>
        </AnimatePresence>
        <span className="text-[18px] font-medium tracking-normal text-[#86868b]">{h > 0 ? "hr" : unit}</span>
      </div>

      <div
        className="relative h-[72px] overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_10px_30px_-18px_rgba(0,0,0,.3)]"
        style={{ width: VIEW, maxWidth: "100%", maskImage: "linear-gradient(90deg,transparent,#000 22%,#000 78%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 22%,#000 78%,transparent)" }}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { touched.current = true; goTo(Math.min(max, value + 1)); }
          if (e.key === "ArrowLeft") { touched.current = true; goTo(Math.max(min, value - 1)); }
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: -(max - min) * STEP, right: 0 }}
          dragElastic={0.12}
          dragTransition={{ power: 0.25, timeConstant: 260, modifyTarget: (t) => Math.round(t / STEP) * STEP, bounceStiffness: 300, bounceDamping: 30 }}
          style={{ x, paddingLeft: VIEW / 2, paddingRight: VIEW / 2 }}
          className="absolute left-0 top-0 flex h-full cursor-grab items-end active:cursor-grabbing"
        >
          {ticks.map((t) => {
            const major = t % 5 === 0;
            return (
              <div key={t} className="relative flex h-full flex-none items-end justify-center" style={{ width: STEP, marginLeft: t === min ? -STEP / 2 : 0 }}>
                <span className="block w-[1.5px] rounded-full" style={{ height: major ? 26 : 14, marginBottom: 14, background: major ? "#1d1d1f" : "#c7c7cc" }} />
                {t % labelEvery === 0 && <span className="absolute top-2.5 text-[11px] font-medium tabular-nums text-[#86868b]">{t}</span>}
              </div>
            );
          })}
        </motion.div>
        <span className="pointer-events-none absolute bottom-2 left-1/2 top-2 w-[3px] -translate-x-1/2 rounded-full" style={{ background: accent }} />
      </div>

      <div className="flex gap-2">
        {presets.map((p) => (
          <motion.button
            key={p}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => { touched.current = true; goTo(p); }}
            animate={{ backgroundColor: value === p ? accent : "#ffffff", color: value === p ? "#ffffff" : "#1d1d1f" }}
            className="h-9 rounded-full px-4 text-[13px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
          >
            {timeUnit ? (p >= 60 ? `${p / 60} hr` : `${p} min`) : `${prefix}${p}`}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
