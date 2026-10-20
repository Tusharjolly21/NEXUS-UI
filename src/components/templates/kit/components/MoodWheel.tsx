"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";

interface Mood { word: string; a: string; b: string }

const MOODS: Mood[] = [
  { word: "Calm", a: "#8ec5ff", b: "#d7f0ff" },
  { word: "Curious", a: "#7ee0c3", b: "#e3fff4" },
  { word: "Hopeful", a: "#ffd36e", b: "#fff4d1" },
  { word: "Playful", a: "#ff9fd0", b: "#ffe6f3" },
  { word: "Proud", a: "#ffb057", b: "#ffeacc" },
  { word: "Restless", a: "#ff7a6b", b: "#ffe0db" },
  { word: "Tired", a: "#a7a3d9", b: "#ebe9ff" },
  { word: "Tender", a: "#f6a6b2", b: "#ffe9ec" },
  { word: "Focused", a: "#5aa7ff", b: "#dceeff" },
  { word: "Grateful", a: "#9fd36b", b: "#eefcd9" },
];

const STEP = 0.32; // radians between words
const R = 220;

function Word({ i, pos, text }: { i: number; pos: MotionValue<number>; text: string }) {
  const a = useTransform(pos, (p) => (i - p) * STEP);
  const x = useTransform(a, (v) => Math.cos(v) * R - R);
  const y = useTransform(a, (v) => Math.sin(v) * R);
  const rotate = useTransform(a, (v) => (v * 180) / Math.PI);
  const opacity = useTransform(a, (v) => Math.max(0, 1 - Math.abs(v) / 1.25));
  const scale = useTransform(a, (v) => 1 + Math.max(0, 0.45 - Math.abs(v) * 1.2));
  return (
    <motion.span
      aria-hidden="true"
      className="absolute left-[68px] top-1/2 -mt-[14px] origin-left whitespace-nowrap text-[20px] font-medium tracking-[-0.01em] text-[#1d1d1f]"
      style={{ x, y, rotate, opacity, scale }}
    >
      {text}
    </motion.span>
  );
}

/**
 * Feelings laid along the rim of a wheel. Drag or scroll it and the words roll
 * past; the one at the centre gets bracketed, fills the sentence, and the orb
 * beside it melts into that mood's colours.
 */
export default function MoodWheel({ moods = MOODS, autoplay = false }: { moods?: Mood[]; autoplay?: boolean }) {
  const pos = useMotionValue(2);
  const [idx, setIdx] = useState(2);
  const drag = useRef<{ y: number; p: number; v: number; ly: number; lt: number } | null>(null);
  const touched = useRef(false);
  const wheelT = useRef<number | undefined>(undefined);
  useMotionValueEvent(pos, "change", (p) => setIdx(Math.max(0, Math.min(moods.length - 1, Math.round(p)))));
  const settle = (velocity = 0) => animate(pos, pos.get(), { type: "inertia", velocity, power: 0.4, timeConstant: 260, modifyTarget: (t) => Math.max(0, Math.min(moods.length - 1, Math.round(t))), min: 0, max: moods.length - 1, bounceStiffness: 300, bounceDamping: 30 });
  const go = (i: number) => animate(pos, i, { type: "spring", stiffness: 140, damping: 20 });

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => !touched.current && go(Math.floor(Math.random() * moods.length)), 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const m = moods[idx];

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative h-[280px] w-[420px] max-w-full cursor-grab touch-none select-none overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] active:cursor-grabbing"
        role="slider"
        tabIndex={0}
        aria-label="Mood"
        aria-valuetext={m.word}
        aria-valuemin={0}
        aria-valuemax={moods.length - 1}
        aria-valuenow={idx}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { touched.current = true; go(Math.min(moods.length - 1, idx + 1)); }
          if (e.key === "ArrowUp") { touched.current = true; go(Math.max(0, idx - 1)); }
        }}
        onWheel={(e) => { touched.current = true; pos.set(Math.max(-0.4, Math.min(moods.length - 0.6, pos.get() + e.deltaY * 0.004))); clearTimeout(wheelT.current); wheelT.current = window.setTimeout(() => settle(0), 120); }}
        onPointerDown={(e) => {
          touched.current = true;
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
          drag.current = { y: e.clientY, p: pos.get(), v: 0, ly: e.clientY, lt: performance.now() };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const now = performance.now();
          d.v = ((d.ly - e.clientY) / 40) / Math.max(0.008, (now - d.lt) / 1000);
          d.ly = e.clientY; d.lt = now;
          pos.set(d.p + (d.y - e.clientY) / 40);
        }}
        onPointerUp={() => { if (drag.current) { settle(drag.current.v); drag.current = null; } }}
      >
        {/* orb */}
        <motion.div
          className="absolute right-8 top-1/2 h-[150px] w-[150px] -mt-[75px] rounded-full"
          initial={false}
          animate={{ background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${m.b} 30%, ${m.a} 72%, ${m.a} 100%)`, boxShadow: `0 30px 60px -20px ${m.a}` }}
          transition={{ duration: 0.8 }}
        />
        <motion.div className="absolute right-8 top-1/2 h-[150px] w-[150px] -mt-[75px] rounded-full mix-blend-overlay" animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} style={{ background: "conic-gradient(from 0deg, rgba(255,255,255,.5), rgba(255,255,255,0) 40%, rgba(255,255,255,.4) 70%, rgba(255,255,255,0))" }} />
        {/* wheel */}
        {moods.map((md, i) => <Word key={md.word} i={i} pos={pos} text={md.word} />)}
        {/* brackets around the centre slot */}
        <span className="pointer-events-none absolute left-[50px] top-1/2 -mt-[22px] h-[44px] w-[8px] rounded-l-md border-y-2 border-l-2 border-[#1d1d1f]" aria-hidden="true" />
        <span className="pointer-events-none absolute left-[196px] top-1/2 -mt-[22px] h-[44px] w-[8px] rounded-r-md border-y-2 border-r-2 border-[#1d1d1f]" aria-hidden="true" />
      </div>
      <p className="m-0 flex items-baseline gap-1.5 text-[17px] text-[#6e6e73]" aria-live="polite">
        Today I feel
        <span className="relative inline-flex h-6 overflow-hidden font-semibold text-[#1d1d1f]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={m.word} initial={{ y: 22, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -22, opacity: 0, filter: "blur(4px)" }}>
              {m.word.toLowerCase()}.
            </motion.span>
          </AnimatePresence>
        </span>
      </p>
    </div>
  );
}
