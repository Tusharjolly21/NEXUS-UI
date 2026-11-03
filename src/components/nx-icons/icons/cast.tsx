"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CastIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #32ade6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A screen with a signal source in its corner whose two waves broadcast outward one after the other before the screen lights up to receive them. */
export function CastIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CastIconProps) {
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
      <path d="M3 8.5V7a2.5 2.5 0 0 1 2.5-2.5h13A2.5 2.5 0 0 1 21 7v10a2.5 2.5 0 0 1-2.5 2.5H15.2" />
      <motion.path
        d="M3 8.5V7a2.5 2.5 0 0 1 2.5-2.5h13A2.5 2.5 0 0 1 21 7v10a2.5 2.5 0 0 1-2.5 2.5H15.2"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.45, 0.65, 1], ease: "easeInOut" }}
      />
      <motion.circle
        cx="4"
        cy="20"
        r="1.5"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.6, 1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
      {["M4 16.4a3.6 3.6 0 0 1 3.6 3.6", "M4 12.4a7.6 7.6 0 0 1 7.6 7.6"].map((d, i) => (
        <motion.g
          key={i}
          style={{ originX: "16.667%", originY: "83.333%" }}
          initial={false}
          animate={on ? { scale: [0.3, 1.18, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.45 / speed, delay: (on ? 0.1 + i * 0.18 : 0) / speed, ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d={d} stroke={accent} />
        </motion.g>
      ))}
    </svg>
  );
}
