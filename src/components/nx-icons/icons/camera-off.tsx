"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CameraOffIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A camera that dips as a slash is drawn across it, the body and lens pulling back to leave a clean gap. */
export function CameraOffIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CameraOffIconProps) {
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
            d="M6.75 6.75H7.4l1.3-2h6.6l1.3 2H19a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8.5a2 2 0 0 1 2-2z"
            initial={false}
            animate={{ opacity: on ? 0 : 1 }}
            transition={{ duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed }}
          />
          <motion.path
            d="M6.75 6.75H7.4l1.3-2h6.6l1.3 2H19a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8.5a2 2 0 0 1 2-2z"
            initial={false}
            animate={{ pathOffset: on ? 0.0475 : 0.0, pathLength: on ? 0.39 : 0.4919, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <motion.path
            d="M6.75 6.75H7.4l1.3-2h6.6l1.3 2H19a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8.5a2 2 0 0 1 2-2z"
            initial={false}
            animate={{ pathOffset: on ? 0.5462 : 0.4919, pathLength: on ? 0.399 : 0.5081, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <motion.path
            d="M9.45 10.05A3.6 3.6 0 0 1 14.55 15.15A3.6 3.6 0 0 1 9.45 10.05z"
            initial={false}
            animate={{ opacity: on ? 0 : 1 }}
            transition={{ duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed }}
          />
          <motion.path
            d="M9.45 10.05A3.6 3.6 0 0 1 14.55 15.15A3.6 3.6 0 0 1 9.45 10.05z"
            initial={false}
            animate={{ pathOffset: on ? 0.1234 : 0.0, pathLength: on ? 0.2531 : 0.4767, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <motion.path
            d="M9.45 10.05A3.6 3.6 0 0 1 14.55 15.15A3.6 3.6 0 0 1 9.45 10.05z"
            initial={false}
            animate={{ pathOffset: on ? 0.5769 : 0.4767, pathLength: on ? 0.3462 : 0.5233, opacity: on ? 1 : 0 }}
            transition={{ pathOffset: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, pathLength: { duration: 0.3 / speed, delay: (on ? 0.04 : 0.16) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (on ? 0 : 0.46) / speed } }}
          />
          <path d="M17.4 9.8h.01" stroke={accent} strokeWidth={strokeWidth + 0.5} />
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
