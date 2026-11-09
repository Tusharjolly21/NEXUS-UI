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
      <g opacity="0.5" strokeWidth={strokeWidth * 0.5}>
        <path d="M14.4 12.0L21.5 12.0M12.0 9.6L12.0 2.5M9.6 12.0L2.5 12.0M12.0 14.4L12.0 21.5" />
        <circle cx="12" cy="12" r="5.5" />
      </g>
      <circle cx="12" cy="12" r="9.5" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 360] } : { rotate: 0 }}
        transition={on ? { duration: 1 / speed, ease: "linear" } : { duration: 0 / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 12L18.01 5.99A8.5 8.5 0 0 0 16.63 4.87z" fill={accent} fillOpacity="0.34" stroke="none" />
        <path d="M12 12L16.63 4.87A8.5 8.5 0 0 0 15.05 4.06z" fill={accent} fillOpacity="0.2" stroke="none" />
        <path d="M12 12L15.05 4.06A8.5 8.5 0 0 0 13.33 3.6z" fill={accent} fillOpacity="0.09" stroke="none" />
        <path d="M12 12L17.3 6.7" stroke={accent} />
      </motion.g>
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <motion.circle
        cx="18.58"
        cy="14.39"
        r="1"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { scale: [1, 1.9, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.18 : 0) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="18.58"
        cy="14.39"
        r="1.4"
        strokeWidth={strokeWidth * 0.6}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0.6, 1.6], opacity: [0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.18 : 0) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
