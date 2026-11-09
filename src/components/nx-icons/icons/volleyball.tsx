"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VolleyballIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A volleyball that is set upward, spins a full turn and dips over the net line before settling. */
export function VolleyballIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VolleyballIconProps) {
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
      <path d="M3.5 18.2H20.5" />
      <path d="M3.5 21.4H20.5M3.5 18.2V21.4M6.9 18.2V21.4M10.3 18.2V21.4M13.7 18.2V21.4M17.1 18.2V21.4M20.5 18.2V21.4" strokeWidth={strokeWidth * 0.75} />
      <motion.g
        initial={false}
        animate={on ? { y: [0, -1.5, 1.4, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.34, 0.68, 1], ease: ["easeOut", "easeIn", "easeOut"] }}
      >
        <motion.g
          style={{ originX: "50%", originY: "36.67%" }}
          initial={false}
          animate={on ? { rotate: [0, 360] } : { rotate: 360 }}
          transition={{ duration: 0.85 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="12" cy="8.8" r="6" />
          <path d="M12 2.8A8.2 8.2 0 0 1 13.81 9.39M17.2 11.8A8.2 8.2 0 0 1 10.59 10.07M6.8 11.8A8.2 8.2 0 0 1 11.6 6.94" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
