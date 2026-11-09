"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RadarIconProps = {
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

/** The beam sweeps one full turn round the dial and the blip pings as it passes. */
export function RadarIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RadarIconProps) {
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
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="3.2" strokeWidth={strokeWidth * 0.6} />
      <path d="M15.2 12L21.5 12M12 15.2L12 21.5M8.8 12L2.5 12M12 8.8L12 2.5" strokeWidth={strokeWidth * 0.5} opacity="0.55" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 360] } : { rotate: 0 }}
        transition={on ? { duration: 1 / speed, ease: "linear" } : { duration: 0 / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 12L13.91 3.72A8.5 8.5 0 0 1 18.01 5.99z" fill={accent} fillOpacity="0.3" stroke="none" />
        <path d="M12 12L18.08 5.92" stroke={accent} />
      </motion.g>
      <motion.circle
        cx="17.83"
        cy="14.12"
        r="1.1"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { scale: [1, 1.9, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.18 : 0) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="17.83"
        cy="14.12"
        r="1.4"
        strokeWidth={strokeWidth * 0.6}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0.6, 2.2], opacity: [0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.18 : 0) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
