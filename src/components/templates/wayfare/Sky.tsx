"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Wayfare's hero backdrop: the view from a window seat at golden hour. A sea of cloud drifts past in three layers,
 * the sun sits low on the horizon, and a route is drawn from home to wherever the search box is typing, with a plane
 * flying it each time the destination changes. Drawn on a 1440 x 900 stage that crops to fill. With reduced motion
 * the clouds and the plane hold still and the route is simply there.
 */

export type Stop = { name: string; code: string; x: number; y: number };
export const STOPS: Stop[] = [
  { name: "Lisbon", code: "LIS", x: 1040, y: 330 },
  { name: "Kyoto", code: "KIX", x: 1290, y: 200 },
  { name: "Oaxaca", code: "OAX", x: 930, y: 230 },
  { name: "Reykjavík", code: "KEF", x: 1160, y: 140 },
  { name: "Cape Town", code: "CPT", x: 1270, y: 420 },
];
const HOME = { x: 780, y: 600 };

const arc = (s: Stop) => {
  const cx = (HOME.x + s.x) / 2 - 40;
  const cy = Math.min(HOME.y, s.y) - 150;
  return `M${HOME.x} ${HOME.y} Q${Math.round(cx)} ${Math.round(cy)} ${s.x} ${s.y}`;
};

// bumpy cloud tops, drawn twice side by side so they can scroll without a seam
const cloud = (base: number, amp: number, step: number) => {
  let d = `M0 900 L0 ${base}`;
  for (let x = 0; x < 2880; x += step) {
    const up = base - amp * (0.6 + 0.4 * Math.sin(x * 0.013));
    d += ` Q${x + step / 2} ${Math.round(up)} ${x + step} ${base}`;
  }
  return `${d} L2880 900 Z`;
};
const LAYERS = [
  { d: cloud(700, 70, 180), fill: "#c9b6d3", o: 0.9, dur: 140 },
  { d: cloud(760, 60, 150), fill: "#f0cfc6", o: 1, dur: 95 },
  { d: cloud(830, 50, 120), fill: "#ffffff", o: 1, dur: 60 },
];

const noop = () => () => {};

export default function Sky({ stop }: { stop: number }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduce = useReducedMotion();
  const still = hydrated && !!reduce;
  const s = STOPS[stop];
  const d = arc(s);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* sky, from high blue down to a warm horizon */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#1b3566 0%,#3c5f9a 34%,#8d97c2 58%,#f2b89a 76%,#ffd9b0 88%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="wf-sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff7e0" />
            <stop offset="0.22" stopColor="#ffe3a8" />
            <stop offset="1" stopColor="#ffb87a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="1160" cy="690" r="230" fill="url(#wf-sun)" />
        <circle cx="1160" cy="690" r="34" fill="#fff8e6" />

        {/* the route, home to the destination being typed */}
        <g className="hidden md:inline">
          <circle cx={HOME.x} cy={HOME.y} r="5" fill="#ffffff" />
          <text x={HOME.x - 12} y={HOME.y + 26} fontSize="14" fontWeight="600" fill="rgba(255,255,255,.85)">Home</text>
          <AnimatePresence mode="wait">
            <motion.g key={s.code} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
              <motion.path
                d={d}
                fill="none"
                stroke="rgba(255,255,255,.85)"
                strokeWidth="2"
                strokeDasharray="2 9"
                strokeLinecap="round"
                initial={{ pathLength: still ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
              />
              <circle cx={s.x} cy={s.y} r="6" fill="#ffd27a" stroke="#fff" strokeWidth="2.5" />
              <g transform={`translate(${s.x + 14} ${s.y - 34})`}>
                <rect width={s.name.length * 9 + 64} height="34" rx="17" fill="rgba(16,30,62,.55)" />
                <text x="14" y="22" fontSize="14" fontWeight="700" fill="#ffd27a" letterSpacing="0.5">{s.code}</text>
                <text x="54" y="22" fontSize="14" fontWeight="500" fill="#ffffff">{s.name}</text>
              </g>
              {/* the plane */}
              {still ? null : (
                <g>
                  <path d="M-11 0 L9 -2 L13 0 L9 2 Z M-2 -1 L-6 -10 L-2 -10 L4 -1 Z M-2 1 L-6 10 L-2 10 L4 1 Z M-10 -1 L-13 -5 L-11 -5 L-7 -1 Z M-10 1 L-13 5 L-11 5 L-7 1 Z" fill="#ffffff" />
                  <animateMotion dur="2.2s" begin="0s" fill="freeze" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" path={d} />
                </g>
              )}
            </motion.g>
          </AnimatePresence>
        </g>

        {/* the cloud sea */}
        {LAYERS.map((l, i) => (
          <motion.path
            key={i}
            d={l.d}
            fill={l.fill}
            opacity={l.o}
            initial={{ x: 0 }}
            animate={still ? { x: 0 } : { x: [0, -1440] }}
            transition={still ? { duration: 0 } : { duration: l.dur, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>
    </div>
  );
}
