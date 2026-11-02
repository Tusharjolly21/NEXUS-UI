"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BellOffIconProps = {
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

/** A bell that gives one last small swing as a slash is drawn across it, the body pulling back to leave a clean gap. */
export function BellOffIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BellOffIconProps) {
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
        style={{ originX: "50%", originY: "14%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 5, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.45 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 3.4v1.4" />
          <motion.path
            d="M7.26 7.26A5.8 5.8 0 0 1 17.8 10.6v5.2l1.2 1.4H5l1.2-1.4V10.6A5.8 5.8 0 0 1 7.26 7.26z"
            initial={false}
            animate={{ opacity: on ? 0 : 1 }}
            transition={{ duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed }}
          />
          <motion.path
            d="M7.26 7.26A5.8 5.8 0 0 1 17.8 10.6v5.2l1.2 1.4H5l1.2-1.4V10.6A5.8 5.8 0 0 1 7.26 7.26z"
            initial={false}
            animate={{ pathOffset: on ? 0.0567 : 0.0, pathLength: on ? 0.3359 : 0.4898, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <motion.path
            d="M7.26 7.26A5.8 5.8 0 0 1 17.8 10.6v5.2l1.2 1.4H5l1.2-1.4V10.6A5.8 5.8 0 0 1 7.26 7.26z"
            initial={false}
            animate={{ pathOffset: on ? 0.5869 : 0.4898, pathLength: on ? 0.351 : 0.5102, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <path d="M10.4 19.9a1.8 1.8 0 0 0 3.2 0" stroke={accent} />
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
