"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VideoOffIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A video camera that dips as a slash is drawn across it, the body pulling back to leave a clean gap. */
export function VideoOffIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VideoOffIconProps) {
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
            d="M6.5 6.5h6A2.5 2.5 0 0 1 15 9v6a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 3 15V9a2.5 2.5 0 0 1 2.5-2.5z"
            initial={false}
            animate={{ opacity: on ? 0 : 1 }}
            transition={{ duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed }}
          />
          <motion.path
            d="M6.5 6.5h6A2.5 2.5 0 0 1 15 9v6a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 3 15V9a2.5 2.5 0 0 1 2.5-2.5z"
            initial={false}
            animate={{ pathOffset: on ? 0.0882 : 0.0, pathLength: on ? 0.2056 : 0.3715, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <motion.path
            d="M6.5 6.5h6A2.5 2.5 0 0 1 15 9v6a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 3 15V9a2.5 2.5 0 0 1 2.5-2.5z"
            initial={false}
            animate={{ pathOffset: on ? 0.4493 : 0.3715, pathLength: on ? 0.4767 : 0.6285, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <motion.path
            d="M15 10.6l4.9-2.9a.7.7 0 0 1 1.1.6v7.4a.7.7 0 0 1-1.1.6L15 13.4"
            initial={false}
            animate={{ opacity: on ? 0 : 1 }}
            transition={{ duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed }}
          />
          <motion.path
            d="M15 10.6l4.9-2.9a.7.7 0 0 1 1.1.6v7.4a.7.7 0 0 1-1.1.6L15 13.4"
            initial={false}
            animate={{ pathOffset: on ? 0.0 : 0.0, pathLength: on ? 0.7316 : 1.0, opacity: on ? 1 : 0 }}
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
