"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChristmasTreeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffcc00. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The tree sways while its baubles light up one after another and the star on top twinkles. */
export function ChristmasTreeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChristmasTreeIconProps) {
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
      <g transform="translate(0 0.28)">

      <motion.g
        style={{ originX: "50%", originY: "87.5%" }}
        initial={false}
        animate={on ? { rotate: [0, 2.5, -2, 1, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.g
          style={{ originX: "50%", originY: "16.46%" }}
          initial={false}
          animate={on ? { scale: [1, 1, 1.35, 0.92, 1], rotate: [0, 0, 24, -10, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.55, 0.72, 0.86, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 1.45L12.62 3.1L14.38 3.18L13 4.27L13.47 5.97L12 5L10.53 5.97L11 4.27L9.62 3.18L11.38 3.1Z" fill={accent} stroke="none" />
        </motion.g>
        <path d="M12 5L15.23 8.39A0.6 0.6 0 0 1 14.8 9.4L13.8 9.4L17.03 12.79A0.6 0.6 0 0 1 16.6 13.8L15.6 13.8L18.83 17.19A0.6 0.6 0 0 1 18.4 18.2L13.6 18.2L13.6 20.4A0.6 0.6 0 0 1 13 21L11 21A0.6 0.6 0 0 1 10.4 20.4L10.4 18.2L5.6 18.2A0.6 0.6 0 0 1 5.17 17.19L8.4 13.8L7.4 13.8A0.6 0.6 0 0 1 6.97 12.79L10.2 9.4L9.2 9.4A0.6 0.6 0 0 1 8.77 8.39Z" />
        <motion.circle cx="12" cy="12.9" r="0.8" fill="currentColor" stroke="none" style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { scale: [1, 1, 1.6, 1, 1] } : { scale: 1 }} transition={{ duration: 0.9 / speed, times: [0, 0.12, 0.22, 0.34, 1] }} />
        <motion.circle cx="10.2" cy="15.65" r="0.8" fill="currentColor" stroke="none" style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { scale: [1, 1, 1.6, 1, 1] } : { scale: 1 }} transition={{ duration: 0.9 / speed, times: [0, 0.26, 0.36, 0.48, 1] }} />
        <motion.circle cx="13.8" cy="15.65" r="0.8" fill="currentColor" stroke="none" style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { scale: [1, 1, 1.6, 1, 1] } : { scale: 1 }} transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.5, 0.62, 1] }} />
      </motion.g>
      </g>
    </svg>
  );
}
