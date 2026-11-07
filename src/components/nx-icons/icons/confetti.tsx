"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ConfettiIconProps = {
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

/** A party popper that recoils with a pop while pieces of confetti burst from its mouth and drift down into place. */
export function ConfettiIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ConfettiIconProps) {
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
      <motion.g
        style={{ originX: "14.58%", originY: "83.33%" }}
        initial={false}
        animate={on ? { scale: [1, 0.93, 1.05, 1], rotate: [0, -7, 3, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.94 18.37L5.13 14.56" stroke={accent} />
        <path d="M14.39 16.75L3.5 20L6.75 9.11A5.4 1.9 45 0 0 14.39 16.75z" />
      </motion.g>
      {([
        ["M17.6 5.9h.01", true, 3, 0, -7.03, 7.03],
        ["M19.2 9.2 20.4 11.2", false, 2, 0.04, -9.23, 2.73],
        ["M12.1 4.6a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0", false, 1.6, 0.08, -2.73, 8.33],
        ["M7.9 3.8 9.5 4.9", true, 2, 0.12, 1.87, 8.58],
        ["M19.6 14.9h.01", false, 3, 0.06, -9.03, -1.97],
        ["M4.4 7.6 5.8 6", false, 2, 0.1, 5.47, 6.13],
      ] as [string, boolean, number, number, number, number][]).map(([d, acc, w, dl, dx, dy], i) => (
        <motion.path
          key={i}
          d={d}
          stroke={acc ? accent : "currentColor"}
          strokeWidth={w}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { x: [dx, 0, 0], y: [dy, -2.5, 0], opacity: [0, 1, 1], scale: [0.2, 1, 1] } : { opacity: 1, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8 / speed, delay: (dl) / speed, times: [0, 0.45, 1], ease: ["easeOut", "easeIn"] }}
        />
      ))}
    </svg>
  );
}
