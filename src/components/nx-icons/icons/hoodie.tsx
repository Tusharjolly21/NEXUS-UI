"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HoodieIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A hoodie whose hood bobs while its drawstrings swing. */
export function HoodieIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HoodieIconProps) {
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
      <path d="M6.2 7.7L2.6 11.99L4.75 13.79L6.2 12.06V20.3" />
      <path d="M17.8 7.7L21.4 11.99L19.25 13.79L17.8 12.06V20.3" />
      <path d="M6.2 20.3H17.8" />
      <path d="M7.6 20.3L9.2 15.9H14.8L16.4 20.3" />
      <motion.g
        style={{ originX: "50%", originY: "32.08%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.1, 0.95, 1.03, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.2 7.7C5.9 5.1 9.2 3.7 12 3.7C14.8 3.7 18.1 5.1 17.8 7.7" />
        <path d="M6.2 7.7C7.6 10.9 10.2 11.5 12 11.5C13.8 11.5 16.4 10.9 17.8 7.7" />
        <motion.g
          style={{ originX: "42.5%", originY: "47%" }}
          initial={false}
          animate={on ? { rotate: [0, 16, -11, 6, -3, 0] } : { rotate: 0 }}
          transition={{ duration: 0.75 / speed, delay: (on ? 0.05 : 0) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M10.2 11.28V13.68" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <motion.g
          style={{ originX: "57.5%", originY: "47%" }}
          initial={false}
          animate={on ? { rotate: [0, 16, -11, 6, -3, 0] } : { rotate: 0 }}
          transition={{ duration: 0.75 / speed, delay: (on ? 0.12 : 0) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M13.8 11.28V13.68" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
