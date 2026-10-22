"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface ElasticStepperProps {
  label?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
  accent?: string;
  /** Counts up and down by itself until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

export function ElasticStepper({ label = "Guests", min = 1, max = 8, defaultValue = 2, onChange, accent = "#0071e3", autoplay = false, enableSound = true }: ElasticStepperProps) {
  const play = useSound(enableSound);
  const [value, setValue] = useState(defaultValue);
  const [dir, setDir] = useState(1);
  const body = useAnimationControls();
  const touched = useRef(false);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const step = (d: 1 | -1, byUser = false) => {
    const next = valueRef.current + d;
    if (next < min || next > max) {
      // Rubber-band against the limit.
      body.start({ x: [0, d * 9, d * -3, 0], scaleX: [1, 1.04, 0.99, 1], transition: { duration: 0.45, ease: "easeOut" } });
      return;
    }
    if (byUser) play(d > 0 ? "tap" : "tick", d > 0 ? 0.6 : 0.5);
    valueRef.current = next;
    setDir(d);
    setValue(next);
    onChange?.(next);
  };

  useEffect(() => {
    if (!autoplay) return;
    const seq: (1 | -1)[] = [1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      step(seq[k++ % seq.length]);
    }, 520);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const btn = (d: 1 | -1, disabled: boolean) => (
    <motion.button
      type="button"
      aria-label={d > 0 ? `Add one ${label.toLowerCase()}` : `Remove one ${label.toLowerCase()}`}
      onClick={() => { touched.current = true; step(d, true); }}
      whileTap={{ scale: 0.85 }}
      animate={{ opacity: disabled ? 0.35 : 1 }}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0f0f3] text-[#1d1d1f] hover:bg-[#e8e8ed] dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:hover:bg-[#48484a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ outlineColor: accent }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
        <path d={d > 0 ? "M12 5v14M5 12h14" : "M5 12h14"} />
      </svg>
    </motion.button>
  );

  return (
    <div className="flex flex-col items-center gap-4 [--es-off:#d2d2d7] dark:[--es-off:#48484a]">
      <motion.div animate={body} className="flex items-center gap-5 rounded-full bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-16px_rgba(0,0,0,.3)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]" role="group" aria-label={label}>
        {btn(-1, value <= min)}
        <div className="relative flex h-11 w-12 items-center justify-center overflow-hidden text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.span
              key={value}
              custom={dir}
              variants={{
                enter: (d: number) => ({ y: d * 28, opacity: 0, scale: 0.6, filter: "blur(4px)" }),
                center: { y: 0, opacity: 1, scale: 1, filter: "blur(0px)" },
                exit: (d: number) => ({ y: d * -28, opacity: 0, scale: 0.6, filter: "blur(4px)" }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 520, damping: 30 }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
        {btn(1, value >= max)}
      </motion.div>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: max - min + 1 }, (_, i) => (
          <motion.span key={i} className="h-1.5 rounded-full transition-colors duration-200" style={{ backgroundColor: i + min <= value ? accent : "var(--es-off)" }} initial={false} animate={{ width: i + min === value ? 18 : 6 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
        ))}
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">{label}, between {min} and {max}. Push past either end.</span>
    </div>
  );
}
