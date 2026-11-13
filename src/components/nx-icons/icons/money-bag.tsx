"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MoneyBagIconProps = {
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

/** A money sack squashes and stretches as the dollar sign on it flips over like a coin. */
export function MoneyBagIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MoneyBagIconProps) {
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
      <g transform="translate(0 -0.88)">
      <motion.g style={{ originX: "50%", originY: "88.33%" }} initial={false} animate={on ? { scaleY: [1, 0.9, 1.07, 0.98, 1], scaleX: [1, 1.07, 0.96, 1.01, 1] } : { scaleY: 1, scaleX: 1 }} transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.45, 0.7, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M10.4 7.6V6.2A1.6 1.6 0 0 1 13.6 6.2V7.6"  />
      <path d="M9.4 7.6L14.6 7.6"  />
      <path d="M10.4 7.6C6.4 10.2 3.4 14.4 4.2 17.7C4.9 20.6 8.2 21.2 12 21.2C15.8 21.2 19.1 20.6 19.8 17.7C20.6 14.4 17.6 10.2 13.6 7.6"  />
      <motion.g style={{ originX: "50%", originY: "60.83%" }} initial={false} animate={on ? { scaleX: [1, 0, -1, 0, 1] } : { scaleX: 1 }} transition={{ duration: 0.8 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut", delay: (0.1) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M14.2 13C14.2 11.7 9.8 11.5 9.8 13.5C9.8 15.5 14.2 14.4 14.2 16.4C14.2 18.2 9.9 18 9.8 16.9" stroke={accent} />
      <path d="M12 10.6L12 18.6" stroke={accent} />
      </motion.g>
      </motion.g>
      </g>
    </svg>
  );
}
