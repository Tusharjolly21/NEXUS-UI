"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ZapOffIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9500. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A lightning bolt that loses its glow as a slash is drawn across it, the outline pulling back to leave a clean gap. */
export function ZapOffIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ZapOffIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.94, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
          <motion.path
            d="M10.7 13.9 9.9 20.9 19.4 10.1h-6.1L13.9 3.1 4.6 13.9z"
            fill={accent}
            stroke="none"
            initial={false}
            animate={{ fillOpacity: on ? 0 : 0.24 }}
            transition={{ duration: 0.35 / speed }}
          />
          <motion.path
            d="M10.7 13.9 9.9 20.9 19.4 10.1h-6.1L13.9 3.1 4.6 13.9z"
            initial={false}
            animate={{ opacity: on ? 0 : 1 }}
            transition={{ duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed }}
          />
          <motion.path
            d="M10.7 13.9 9.9 20.9 19.4 10.1h-6.1L13.9 3.1 4.6 13.9z"
            initial={false}
            animate={{ pathOffset: on ? 0.0125 : 0.0, pathLength: on ? 0.2067 : 0.2703, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <motion.path
            d="M10.7 13.9 9.9 20.9 19.4 10.1h-6.1L13.9 3.1 4.6 13.9z"
            initial={false}
            animate={{ pathOffset: on ? 0.3214 : 0.2703, pathLength: on ? 0.1662 : 0.2306, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <motion.path
            d="M10.7 13.9 9.9 20.9 19.4 10.1h-6.1L13.9 3.1 4.6 13.9z"
            initial={false}
            animate={{ pathOffset: on ? 0.5142 : 0.5009, pathLength: on ? 0.2035 : 0.2679, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <motion.path
            d="M10.7 13.9 9.9 20.9 19.4 10.1h-6.1L13.9 3.1 4.6 13.9z"
            initial={false}
            animate={{ pathOffset: on ? 0.8199 : 0.7688, pathLength: on ? 0.1662 : 0.2312, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
      </motion.g>
      <motion.path
        d="M4 4 20 20"
        stroke={accent}
        initial={false}
        animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={{
          pathLength: { duration: 0.4 / speed, delay: (on ? 0.06 : 0) / speed, ease: "easeInOut" },
          opacity: { duration: 0.02 / speed, delay: (on ? 0.06 : 0.38) / speed },
        }}
      />
    </svg>
  );
}
