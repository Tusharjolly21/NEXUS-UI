"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VinylRecordIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A record that spins up while bright highlights sweep round its grooves and the grooves shimmer. */
export function VinylRecordIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VinylRecordIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      overflow="visible"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      {[7.2, 5.5].map((r, i) => (
        <motion.circle
          key={r}
          cx="12"
          cy="12"
          r={r}
          strokeWidth={0.8}
          initial={false}
          animate={on ? { strokeOpacity: [1, 0.2, 1, 0.45, 1] } : { strokeOpacity: 1 }}
          transition={{ duration: 0.8 / speed, delay: (i * 0.14) / speed }}
        />
      ))}
      <circle cx="12" cy="12" r="3.2" stroke={accent} />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 720] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: [0.5, 0, 0.25, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        {["M13.86 5.05A7.2 7.2 0 0 1 18.24 8.4", "M10.14 18.95A7.2 7.2 0 0 1 5.76 15.6", "M17.17 13.88A5.5 5.5 0 0 1 14.32 16.98", "M6.83 10.12A5.5 5.5 0 0 1 9.68 7.02"].map((d) => (
          <path key={d} d={d} stroke={accent} strokeWidth={1.8} />
        ))}
      </motion.g>
    </svg>
  );
}
