"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CakeIconProps = {
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

/** A two-tier birthday cake whose candle flame flickers while the icing wiggles and the cake gives a little bounce. */
export function CakeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CakeIconProps) {
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
        initial={false}
        animate={on ? { y: [0, -0.8, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed }}
      >
        <rect x="3.5" y="14.5" width="17" height="6.5" rx="1.6" />
        <rect x="6.5" y="10" width="11" height="4.5" rx="1.3" />
        <path d="M12 10V7.6" />
        <motion.path
          d="M6.4 17.9q1.4 1.5 2.8 0t2.8 0 2.8 0 2.8 0"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M6.4 17.9q1.4 1.5 2.8 0t2.8 0 2.8 0 2.8 0", "M6.4 17.9q1.4 -1.5 2.8 0t2.8 0 2.8 0 2.8 0", "M6.4 17.9q1.4 1.5 2.8 0t2.8 0 2.8 0 2.8 0"] } : { d: "M6.4 17.9q1.4 1.5 2.8 0t2.8 0 2.8 0 2.8 0" }}
          transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
        />
      </motion.g>
      <motion.path
        d="M12 6.4c-1.25-1-1.45-2.3 0-3.9 1.45 1.6 1.25 2.9 0 3.9z"
        fill={accent}
        stroke={accent}
        strokeWidth={1.3}
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.22, 0.86, 1.14, 1], skewX: [0, -8, 6, -4, 0] } : { scaleY: 1, skewX: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
