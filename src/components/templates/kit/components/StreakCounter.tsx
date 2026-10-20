"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export interface StreakCounterProps {
  start?: number;
  /** Logs a day by itself every couple of seconds until the user presses. */
  autoplay?: boolean;
}

/**
 * Press to add a day. The number rolls up, the week strip slides along to make
 * room for today, and the flame bursts into embers that fly out and fall back
 * into it, burning a little hotter each time.
 */
export default function StreakCounter({ start = 11, autoplay = false }: StreakCounterProps) {
  const [count, setCount] = useState(start);
  const [burst, setBurst] = useState(0);
  const flame = useAnimationControls();
  const touched = useRef(false);
  const embers = useRef(
    Array.from({ length: 16 }, (_, i) => {
      const a = -Math.PI / 2 + (i / 16 - 0.5) * Math.PI * 1.4;
      const d = 40 + (i % 4) * 14;
      return { x: Math.cos(a) * d, y: Math.sin(a) * d - 10, s: 3 + (i % 3) * 2, delay: (i % 5) * 0.02 };
    }),
  );

  const log = () => {
    setCount((c) => c + 1);
    setBurst((b) => b + 1);
    flame.start({ scale: [1, 0.75, 1.25, 1], rotate: [0, -6, 4, 0], transition: { duration: 0.7, ease: "easeOut" } });
  };

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => !touched.current && log(), 2200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const heat = Math.min(1, (count - start) / 8);
  const outer = `hsl(${30 - heat * 22}, 100%, ${56 - heat * 4}%)`;
  const inner = `hsl(${48 - heat * 10}, 100%, ${66 + heat * 6}%)`;
  // the last 7 days, newest on the right
  const strip = Array.from({ length: 7 }, (_, k) => count - 6 + k);

  return (
    <div className="flex w-[320px] flex-col items-center gap-5 rounded-[28px] bg-white px-6 pb-6 pt-7 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)]">
      <div className="relative flex h-[96px] w-[96px] items-center justify-center">
        <AnimatePresence>
          {embers.current.map((e, i) => (
            <motion.span
              key={`${burst}-${i}`}
              aria-hidden="true"
              className="absolute rounded-full"
              style={{ width: e.s, height: e.s, background: i % 2 ? outer : inner }}
              initial={{ x: 0, y: 10, opacity: burst ? 1 : 0, scale: 1 }}
              animate={burst ? { x: [0, e.x, e.x * 0.2], y: [10, e.y, 18], opacity: [1, 1, 0], scale: [1, 1.2, 0.3] } : {}}
              transition={{ duration: 0.9, times: [0, 0.45, 1], ease: "easeOut", delay: e.delay }}
            />
          ))}
        </AnimatePresence>
        <motion.svg animate={flame} width="72" height="84" viewBox="0 0 24 28" aria-hidden="true" style={{ originY: 1 }}>
          <motion.path
            d="M12 1c1 4.5 6 7.5 6 13.5A6 6 0 0 1 12 21a6 6 0 0 1-6-6.5c0-2.6 1.4-4.4 2.6-5.6.2 1.8 1 3 2.4 3.6C10.6 8.6 11 4.5 12 1z"
            animate={{ fill: outer }}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            d="M12 11c.6 2.3 3 3.6 3 6.4A3 3 0 0 1 12 21a3 3 0 0 1-3-3.4c0-1.6.9-2.6 1.6-3.2.2 1 .7 1.5 1.2 1.7-.2-1.9-.1-3.5.2-5.1z"
            animate={{ fill: inner, scaleY: [1, 1.08, 0.96, 1] }}
            transition={{ fill: { duration: 0.5 }, scaleY: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }}
            style={{ originY: 1 }}
          />
        </motion.svg>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative flex h-[60px] items-center overflow-hidden text-[56px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] tabular-nums" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={count} initial={{ y: 50, opacity: 0, filter: "blur(6px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -50, opacity: 0, filter: "blur(6px)" }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
              {count}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="text-[14px] font-medium text-[#86868b]">day streak</span>
      </div>

      <div className="w-full overflow-hidden">
        <motion.div className="flex justify-between" layout>
          <AnimatePresence mode="popLayout" initial={false}>
            {strip.map((d) => {
              const today = d === count;
              return (
                <motion.div
                  key={d}
                  layout
                  initial={{ opacity: 0, x: 30, scale: 0.6 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="text-[11px] font-medium text-[#86868b]">{DAYS[((d % 7) + 7) % 7]}</span>
                  <motion.span
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    initial={false}
                    animate={{ backgroundColor: today ? outer : "#fff1e0", scale: today ? [0.6, 1.15, 1] : 1 }}
                    transition={{ duration: 0.45 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={today ? "#fff" : "#ff9f0a"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  </motion.span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => { touched.current = true; log(); }}
        className="h-11 w-full rounded-full text-[15px] font-semibold text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
        animate={{ backgroundColor: outer }}
      >
        Log today
      </motion.button>
    </div>
  );
}
