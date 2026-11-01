"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WineIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A wine glass that leans for a toast, the wine swirling and a sparkle flashing. */
export function WineIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WineIconProps) {
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
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, 7, -5, 2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <motion.path
          d="M9.8 6.6h4.4"
          stroke={accent}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, -12, 10, -5, 0], y: [0, 0.4, -0.2, 0.2, 0] } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        />
        <path d="M7 3h10c0 4.8-1.3 8.2-5 8.2S7 7.8 7 3z" />
        <path d="M12 11.2V20" />
        <path d="M8.5 20.5h7" />
      </motion.g>
      <motion.path
        d="M19.4 5.2l1.5-1.5M20.4 8h1.4"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.5, 1] }}
      />
    </svg>
  );
}
