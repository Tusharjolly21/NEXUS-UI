"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GavelIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The gavel lifts, strikes the sound block and a small burst of impact lines appears. */
export function GavelIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GavelIconProps) {
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
        style={{ originX: "84.38%", originY: "72.29%" }}
        initial={false}
        animate={on ? { rotate: [0, 26, 26, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.4, 0.5, 0.62, 0.8], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="5.29" y="6.24" width="10" height="5.5" rx="1.2" transform="rotate(-50 10.29 8.99)" />
        <path d="M10.05 5L14.26 8.54" stroke={accent} strokeWidth={1.4} />
        <path d="M6.32 9.45L10.53 12.98" stroke={accent} strokeWidth={1.4} />
        <path d="M12.4 10.76L20.25 17.35" />
      </motion.g>
      <motion.rect
        x="3.75"
        y="17.35"
        width="11"
        height="3"
        rx="1"
        initial={false}
        animate={on ? { y: [0, 0, 0.6, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.5, 0.58, 0.75] }}
      />
      <motion.g
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0], scale: [0.6, 1, 1.1, 1.1] } : { opacity: 0, scale: 0.6 }}
        style={{ originX: "64.17%", originY: "78.54%" }}
        transition={{ duration: 0.5 / speed, delay: (0.42) / speed, times: [0, 0.2, 0.7, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M17.01 17.84L18.03 17.21M17.3 18.85L18.5 18.85M17.01 19.86L18.03 20.49" />
      </motion.g>
    </svg>
  );
}
