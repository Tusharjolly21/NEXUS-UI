"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BusStopIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A bus stop sign that sways on its pole while the little bus on it bounces on its wheels. */
export function BusStopIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BusStopIconProps) {
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
        style={{ originX: "50%", originY: "89.58%" }}
        initial={false}
        animate={on ? { rotate: [0, -3.5, 2.5, -1.2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 15.5V21.5M8.5 21.5H15.5" />
        <rect x="3.5" y="2.5" width="17" height="13" rx="2.5" />
        <motion.g
          initial={false}
          animate={on ? { y: [0, 0.6, -0.35, 0.2, 0] } : { y: 0 }}
          transition={{ duration: 0.8 / speed, ease: "easeInOut", delay: (on ? 0.1 : 0) / speed }}
        >
          <circle cx="9.6" cy="10.95" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="14.4" cy="10.95" r="1.3" fill="currentColor" stroke="none" />
          <rect x="6.5" y="4.8" width="11" height="5.4" rx="1.2" strokeWidth={strokeWidth * 0.75} />
          <rect x="8" y="6.5" width="2.2" height="1.8" rx="0.3" fill={accent} stroke="none" />
          <rect x="10.9" y="6.5" width="2.2" height="1.8" rx="0.3" fill={accent} stroke="none" />
          <rect x="13.8" y="6.5" width="2.2" height="1.8" rx="0.3" fill={accent} stroke="none" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
