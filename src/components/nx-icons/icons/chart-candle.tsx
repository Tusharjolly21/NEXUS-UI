"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChartCandleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Three candlesticks flatten to dashes and shoot back up one after another like a price tick. */
export function ChartCandleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChartCandleIconProps) {
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
        style={{ originX: "50%", originY: "51.042%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0.18, 1.12, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.8 / speed, delay: (on ? 0 : 0) / speed, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5 5.5V19" />
        <rect x="3.4" y="9.5" width="3.2" height="5.5" rx="0.6" fill="currentColor" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "42.708%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0.18, 1.12, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.8 / speed, delay: (on ? 0.1 : 0) / speed, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 3.5V17.5" />
        <rect x="10.4" y="7" width="3.2" height="6.5" rx="0.6" fill={accent} stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "59.375%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0.18, 1.12, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.8 / speed, delay: (on ? 0.2 : 0) / speed, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M19 8V20.5" />
        <rect x="17.4" y="11.5" width="3.2" height="5.5" rx="0.6" fill="currentColor" />
      </motion.g>
    </svg>
  );
}
