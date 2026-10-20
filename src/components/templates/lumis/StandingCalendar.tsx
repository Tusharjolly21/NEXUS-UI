"use client";
/** Copy of the Motion Kit Standing Calendar recoloured for Lumis (tasks handled per day). */
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface StandingCalendarProps {
  weeks?: number;
  /** What each count is, shown after the total. */
  noun?: string;
  accent?: string;
  /** Stands up and lies down on a loop until the user interacts. */
  autoplay?: boolean;
}

const CELL = 14;
const GAP = 4;
const LEVELS = ["#ebedf0", "#f5d0fe", "#e879f9", "#c026d3", "#86198f"];

/** Deterministic sample data with a weekly rhythm and a busy stretch. */
function makeData(weeks: number) {
  const st = { seed: 7 };
  const rnd = () => {
    st.seed = (st.seed * 9301 + 49297) % 233280;
    return st.seed / 233280;
  };
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const weekend = d >= 5 ? 0.4 : 1;
      const season = 0.55 + 0.45 * Math.sin((w / weeks) * Math.PI * 1.6 + 0.6);
      return Math.max(0, Math.round(rnd() * 12 * weekend * season - 1.5));
    }),
  );
}

/**
 * A year-of-activity grid that stands up into a 3D field of columns. Each cell
 * becomes a box (top, front and side faces) whose height is its count, and the
 * columns rise in a wave from the first week to the last.
 */
export default function StandingCalendar({ weeks = 30, noun = "contributions", autoplay = false }: StandingCalendarProps) {
  const [standing, setStanding] = useState(false);
  const [hover, setHover] = useState<{ w: number; d: number; v: number } | null>(null);
  const touched = useRef(false);

  // Deterministic sample data with a weekly rhythm and a busy stretch.
  const data = useMemo(() => makeData(weeks), [weeks]);

  useEffect(() => {
    if (!autoplay) return;
    const a = setTimeout(() => !touched.current && setStanding(true), 800);
    const t = setInterval(() => !touched.current && setStanding((s) => !s), 3800);
    return () => { clearTimeout(a); clearInterval(t); };
  }, [autoplay]);

  const level = (v: number) => (v === 0 ? 0 : v < 3 ? 1 : v < 6 ? 2 : v < 9 ? 3 : 4);
  const total = data.flat().reduce((a, b) => a + b, 0);
  const W = weeks * (CELL + GAP);
  const H = 7 * (CELL + GAP);

  return (
    <div className="flex w-full flex-col items-center gap-5" onPointerDown={() => (touched.current = true)}>
      <div className="flex w-full max-w-[640px] items-baseline justify-between px-1">
        <span className="text-[15px] font-semibold text-[#1d1d1f]">{total.toLocaleString("en-US")} {noun}</span>
        <span className="relative h-5 min-w-[160px] overflow-hidden text-right text-[13px] tabular-nums text-[#6e6e73]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={hover ? `${hover.w}-${hover.d}` : "none"} className="block" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}>
              {hover ? `Week ${hover.w + 1}, ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][hover.d]}: ${hover.v}` : "Hover a day"}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
      <div className="flex h-[250px] w-full items-center justify-center" style={{ perspective: 1600 }}>
        <motion.div
          className="relative"
          style={{ width: W, height: H, transformStyle: "preserve-3d" }}
          initial={false}
          animate={standing ? { rotateX: 58, rotateZ: -32, scale: 0.92, y: 20 } : { rotateX: 0, rotateZ: 0, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          onPointerLeave={() => setHover(null)}
        >
          {data.map((week, w) =>
            week.map((v, d) => {
              const h = standing ? 3 + v * 6 : 0;
              const lv = level(v);
              const top = LEVELS[lv];
              const delay = standing ? 0.25 + w * 0.025 + d * 0.01 : (weeks - w) * 0.01;
              const spring = { type: "spring", stiffness: 160, damping: 16, delay } as const;
              const isHover = hover?.w === w && hover?.d === d;
              return (
                <div
                  key={`${w}-${d}`}
                  className="absolute"
                  style={{ left: w * (CELL + GAP), top: d * (CELL + GAP), width: CELL, height: CELL, transformStyle: "preserve-3d" }}
                  onPointerEnter={() => setHover({ w, d, v })}
                >
                  {/* front face (stands up from the bottom edge) */}
                  <motion.span
                    className="absolute bottom-0 left-0 w-full origin-bottom"
                    style={{ rotateX: -90, background: lv ? `color-mix(in oklab, ${top} 72%, #3b0040)` : "#d9dce1" }}
                    initial={false}
                    animate={{ height: h }}
                    transition={spring}
                  />
                  {/* side face (stands up from the right edge) */}
                  <motion.span
                    className="absolute right-0 top-0 h-full origin-right"
                    style={{ rotateY: 90, background: lv ? `color-mix(in oklab, ${top} 84%, #3b0040)` : "#e2e4e8" }}
                    initial={false}
                    animate={{ width: h }}
                    transition={spring}
                  />
                  {/* top face */}
                  <motion.span
                    className="absolute inset-0 rounded-[3px]"
                    style={{ background: isHover ? "#0f766e" : top }}
                    initial={false}
                    animate={{ z: h, borderRadius: standing ? 1 : 3 }}
                    transition={spring}
                  />
                </div>
              );
            }),
          )}
        </motion.div>
      </div>
      <div className="flex items-center gap-4">
        <div role="group" aria-label="View" className="relative grid grid-cols-2 rounded-xl bg-[#e8e8ed] p-[3px]">
          {["Flat", "Standing"].map((l, i) => (
            <button key={l} type="button" aria-pressed={standing === (i === 1)} onClick={() => { touched.current = true; setStanding(i === 1); }} className="relative z-10 h-8 rounded-[9px] px-5 text-[13px] font-medium text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a21caf]">
              {standing === (i === 1) && <motion.span layoutId="lumis-cal-seg" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" />}
              {l}
            </button>
          ))}
        </div>
        <span className="flex items-center gap-1 text-[11px] text-[#86868b]" aria-hidden="true">
          Less {LEVELS.map((c) => <span key={c} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} />)} More
        </span>
      </div>
    </div>
  );
}
