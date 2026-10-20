"use client";
// Local copy of the Motion Kit Before / After for Launchfolio: the page can pass its own motion
// value for the divider (so other UI can follow it), an aspect class, and a ring colour.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "framer-motion";

export interface BeforeAfterProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** Plays a short sweep on mount and every few seconds until touched. */
  autoplay?: boolean;
  className?: string;
  /** Divider position, 0 to 100. Pass one in to read it elsewhere on the page. */
  value?: MotionValue<number>;
  /** Tailwind aspect classes for the frame. */
  aspect?: string;
  accent?: string;
}

export default function BeforeAfter({ before, after, beforeLabel = "Before", afterLabel = "After", autoplay = false, className = "", value, aspect = "aspect-[16/9]", accent = "#0071e3" }: BeforeAfterProps) {
  const box = useRef<HTMLDivElement>(null);
  const own = useMotionValue(50);
  const target = value ?? own;
  const [now, setNow] = useState(50);
  useMotionValueEvent(target, "change", (v) => setNow(Math.round(v)));
  const pos = useSpring(target, { stiffness: 380, damping: 34, mass: 0.6 });
  const clip = useTransform(pos, (v) => `inset(0 ${100 - v}% 0 0)`);
  const left = useTransform(pos, (v) => `${v}%`);
  const beforeChip = useTransform(pos, [8, 22], [0, 1]);
  const afterChip = useTransform(pos, [78, 92], [1, 0]);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<0 | 1 | 2>(1);
  const touched = useRef(false);

  const setFromX = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    target.set(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  const jump = (v: number, m: 0 | 1 | 2) => {
    touched.current = true;
    setMode(m);
    animate(target, v, { type: "spring", stiffness: 160, damping: 18 });
  };

  useEffect(() => {
    if (!autoplay) return;
    const sweep = () => !touched.current && animate(target, [50, 18, 82, 50], { duration: 2.6, ease: "easeInOut" });
    const a = setTimeout(sweep, 600);
    const b = setInterval(sweep, 6500);
    return () => { clearTimeout(a); clearInterval(b); };
  }, [autoplay, target]);

  return (
    <div className={`flex w-full flex-col items-center gap-5 ${className}`}>
      <div
        ref={box}
        className={`relative ${aspect} w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-[24px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_30px_60px_-28px_rgba(0,0,0,.35)]`}
        onPointerDown={(e) => {
          touched.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setDragging(true);
          setFromX(e.clientX);
        }}
        onPointerMove={(e) => dragging && setFromX(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <div className="absolute inset-0">{after}</div>
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          {before}
        </motion.div>
        <motion.span style={{ opacity: beforeChip }} className="absolute left-3.5 top-3.5 rounded-full bg-white/70 px-[11px] py-1.5 text-[12px] font-semibold text-[#1d1d1f] backdrop-blur-xl backdrop-saturate-150">
          {beforeLabel}
        </motion.span>
        <motion.span style={{ opacity: afterChip }} className="absolute right-3.5 top-3.5 rounded-full bg-white/70 px-[11px] py-1.5 text-[12px] font-semibold text-[#1d1d1f] backdrop-blur-xl backdrop-saturate-150">
          {afterLabel}
        </motion.span>
        <motion.div className="pointer-events-none absolute inset-y-0 w-0" style={{ left }}>
          <span className="absolute inset-y-0 -left-px w-[2px] bg-white shadow-[0_0_0_.5px_rgba(0,0,0,.08)]" />
          <motion.span
            role="slider"
            tabIndex={0}
            aria-label="Comparison position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={now}
            aria-valuetext={`${now}% before, ${100 - now}% after`}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") { touched.current = true; target.set(Math.max(0, target.get() - 5)); }
              if (e.key === "ArrowRight") { touched.current = true; target.set(Math.min(100, target.get() + 5)); }
            }}
            animate={{ scale: dragging ? 1.18 : 1 }}
            transition={{ type: "spring", stiffness: 500, damping: dragging ? 22 : 12 }}
            className="pointer-events-auto absolute left-[-23px] top-1/2 -mt-[23px] flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-[0_8px_20px_-6px_rgba(0,0,0,.35),0_0_0_.5px_rgba(0,0,0,.08)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ ["--tw-ring-color" as string]: accent }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </motion.span>
        </motion.div>
      </div>

      <div role="group" aria-label="Jump to" className="relative grid w-[270px] grid-cols-3 rounded-xl bg-[#e8e8ed] p-[3px]">
        {(["Before", "Split", "After"] as const).map((l, i) => (
          <button
            key={l}
            type="button"
            onClick={() => jump([100, 50, 0][i], i as 0 | 1 | 2)}
            className="relative z-10 h-8 rounded-[9px] text-[13px] font-medium text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
          >
            {mode === i && (
              <motion.span layoutId="lf-ba-seg" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" />
            )}
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
