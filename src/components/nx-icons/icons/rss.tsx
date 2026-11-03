"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RssIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A dot pops and two broadcast arcs ring outward from it one after the other, each leaving a fading ripple. */
export function RssIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RssIconProps) {
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
      <motion.circle
        cx="5.5"
        cy="18.5"
        r="1.6"
        fill={accent}
        stroke="none"
        style={{ originX: "22.9%", originY: "77%" }}
        initial={false}
        animate={on ? { scale: [1, 1.6, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 / speed, ease: "easeOut" }}
      />
      {["M5.5 11.5A7 7 0 0 1 12.5 18.5", "M5.5 5A13.5 13.5 0 0 1 19 18.5"].map((d, i) => (
        <g key={d}>
          <motion.g
            style={{ originX: "22.9%", originY: "77%" }}
            initial={false}
            animate={on ? { scale: [0.6, 1.08, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 / speed, delay: (on ? 0.15 + i * 0.2 : 0) / speed, times: [0, 0.65, 1], ease: "easeOut" }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <path d={d} stroke={accent} />
          </motion.g>
          <motion.g
            style={{ originX: "22.9%", originY: "77%" }}
            initial={false}
            animate={on ? { scale: [1, 1.2], opacity: [0.7, 0] } : { scale: 1, opacity: 0 }}
            transition={{ duration: 0.4 / speed, delay: (on ? 0.3 + i * 0.2 : 0) / speed, ease: "easeOut" }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <path d={d} stroke={accent} />
          </motion.g>
        </g>
      ))}
    </svg>
  );
}
