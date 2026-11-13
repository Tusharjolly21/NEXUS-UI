"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Aurora curtains for the hero sky: three soft ribbons of green and violet light that sway slowly, each on its own
 * clock. Drawn in SVG with a heavy blur, so they read as light rather than shapes. They hold still for reduced
 * motion.
 */
const RIBBONS = [
  { a: "M-80 210 C 220 90, 420 260, 700 150 S 1180 70, 1540 180", b: "M-80 180 C 240 140, 460 200, 720 120 S 1200 130, 1540 150", from: "#5af0b4", to: "#2fb7c9", o: 0.55, d: 14 },
  { a: "M-80 140 C 260 40, 520 190, 820 90 S 1260 40, 1540 120", b: "M-80 120 C 300 90, 540 120, 860 60 S 1240 90, 1540 90", from: "#8a7bff", to: "#5af0b4", o: 0.4, d: 18 },
  { a: "M-80 260 C 300 200, 560 300, 900 220 S 1300 180, 1540 250", b: "M-80 240 C 260 260, 600 240, 880 260 S 1320 200, 1540 230", from: "#2fb7c9", to: "#8a7bff", o: 0.3, d: 22 },
];

const noop = () => () => {};

export default function Curtains({ className = "" }: { className?: string }) {
  // false while hydrating (the server can't know the setting), then the visitor's real setting
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduce = useReducedMotion();
  const still = hydrated && !!reduce;
  return (
    <svg className={`pointer-events-none ${className}`} viewBox="0 0 1440 420" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <filter id="au-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="26" /></filter>
        {RIBBONS.map((r, i) => (
          <linearGradient key={i} id={`au-g${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={r.from} stopOpacity="0" />
            <stop offset="0.3" stopColor={r.from} />
            <stop offset="0.7" stopColor={r.to} />
            <stop offset="1" stopColor={r.to} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      <g filter="url(#au-blur)">
        {RIBBONS.map((r, i) => (
          <path key={i} d={r.a} fill="none" stroke={`url(#au-g${i})`} strokeWidth={70 - i * 14} strokeLinecap="round" opacity={r.o}>
            {still ? null : <animate attributeName="d" values={`${r.a};${r.b};${r.a}`} dur={`${r.d}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />}
          </path>
        ))}
      </g>
    </svg>
  );
}
