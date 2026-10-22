"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface RulerPickerProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: string;
  presets?: number[];
  accent?: string;
  onChange?: (v: number) => void;
  /** Glides between presets by itself until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const STEP = 12; // px per unit
const VIEW = 380;

export function RulerPicker({ min = 0, max = 90, defaultValue = 25, unit = "min", presets = [5, 15, 30, 60], accent = "#ff9f0a", onChange, autoplay = false, enableSound = true }: RulerPickerProps) {
  const play = useSound(enableSound);
  const x = useMotionValue(-(defaultValue - min) * STEP);
  const [value, setValue] = useState(defaultValue);
  const [dir, setDir] = useState(1);
  const touched = useRef(false);
  // True while the ruler is moving because of the user (drag, fling, arrow keys); false for autoplay and preset glides.
  const audible = useRef(false);
  // True while an autoplay glide is moving the ruler; it ticks a little more sparsely than the user does.
  const autoGlide = useRef(false);
  const lastStep = useRef(defaultValue);
  const lastTick = useRef(0);

  useMotionValueEvent(x, "change", (v) => {
    const next = Math.max(min, Math.min(max, Math.round(-v / STEP) + min));
    if (next !== lastStep.current) {
      lastStep.current = next;
      const now = performance.now();
      if (audible.current && now - lastTick.current >= 40) {
        lastTick.current = now;
        play("tick", 0.4);
      } else if (autoGlide.current && now - lastTick.current >= 150) {
        lastTick.current = now;
        play.auto("tick", 0.3);
      }
    }
    setValue((prev) => {
      if (prev !== next) {
        setDir(next > prev ? 1 : -1);
        onChange?.(next);
      }
      return next;
    });
  });

  const goTo = (v: number) => animate(x, -(v - min) * STEP, { type: "spring", stiffness: 140, damping: 22 });

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const seq = [60, 5, 45, 15, 30];
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      audible.current = false;
      autoGlide.current = true;
      goTo(seq[k++ % seq.length]);
    }, 2200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const ticks = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const h = Math.floor(value / 60);
  const m = value % 60;

  return (
    <div className="flex w-full flex-col items-center gap-6" onPointerDown={() => { touched.current = true; autoGlide.current = false; }}>
      <div className="flex h-[64px] items-baseline gap-1 text-[56px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] tabular-nums dark:text-[#f5f5f7]" aria-live="polite">
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
            {h > 0 ? `${h}:${String(m).padStart(2, "0")}` : value}
          </motion.span>
        </AnimatePresence>
        <span className="text-[18px] font-medium tracking-normal text-[#86868b] dark:text-[#98989d]">{h > 0 ? "hr" : unit}</span>
      </div>

      <div
        className="relative h-[72px] overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_10px_30px_-18px_rgba(0,0,0,.3)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
        style={{ width: VIEW, maxWidth: "100%", maskImage: "linear-gradient(90deg,transparent,#000 22%,#000 78%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 22%,#000 78%,transparent)" }}
        role="slider"
        tabIndex={0}
        aria-label="Duration"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { touched.current = true; audible.current = true; goTo(Math.min(max, value + 1)); }
          if (e.key === "ArrowLeft") { touched.current = true; audible.current = true; goTo(Math.max(min, value - 1)); }
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: -(max - min) * STEP, right: 0 }}
          dragElastic={0.12}
          onDragStart={() => { audible.current = true; }}
          dragTransition={{ power: 0.25, timeConstant: 260, modifyTarget: (t) => Math.round(t / STEP) * STEP, bounceStiffness: 300, bounceDamping: 30 }}
          style={{ x, paddingLeft: VIEW / 2, paddingRight: VIEW / 2 }}
          className="absolute left-0 top-0 flex h-full cursor-grab items-end active:cursor-grabbing"
        >
          {ticks.map((t) => {
            const major = t % 5 === 0;
            return (
              <div key={t} className="relative flex h-full flex-none items-end justify-center" style={{ width: STEP, marginLeft: t === min ? -STEP / 2 : 0 }}>
                <span className={`block w-[1.5px] rounded-full ${major ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#c7c7cc] dark:bg-[#636366]"}`} style={{ height: major ? 26 : 14, marginBottom: 14 }} />
                {t % 15 === 0 && <span className="absolute top-2.5 text-[11px] font-medium tabular-nums text-[#86868b] dark:text-[#98989d]">{t}</span>}
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
            onClick={() => { touched.current = true; audible.current = false; autoGlide.current = false; play("tap", 0.6); goTo(p); }}
            style={value === p ? { backgroundColor: accent } : undefined}
            className={`h-9 rounded-full px-4 text-[13px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,.08)] transition-colors ${value === p ? "text-white" : "bg-white text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]`}
          >
            {p >= 60 ? `${p / 60} hr` : `${p} min`}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
