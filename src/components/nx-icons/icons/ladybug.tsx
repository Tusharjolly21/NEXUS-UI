"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LadybugIconProps = {
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

/** The ladybug lifts its spotted wing cases apart twice, as if about to take off, and folds them shut. */
export function LadybugIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LadybugIconProps) {
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
      <g transform="translate(0 0.33)">

      <path d="M6.28 17.3L4.55 18.3M17.72 17.3L19.45 18.3M5.4 14L3.4 14M18.6 14L20.6 14M6.28 10.7L4.55 9.7M17.72 10.7L19.45 9.7" />
      <motion.g
        style={{ originX: "50%", originY: "30.83%" }}
        initial={false}
        animate={on ? { rotate: [0, 13, 6, 13, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.45, 0.65, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 7.4A6.6 6.6 0 0 0 12 20.6Z" fill={accent} />
        <circle cx="9" cy="12.01" r="1.1" fill="currentColor" stroke="none" /><circle cx="9" cy="15.99" r="1.1" fill="currentColor" stroke="none" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "30.83%" }}
        initial={false}
        animate={on ? { rotate: [0, -13, -6, -13, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.45, 0.65, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 7.4A6.6 6.6 0 0 1 12 20.6Z" fill={accent} stroke="none" />
        <path d="M12 7.4A6.6 6.6 0 0 1 12 20.6" />
        <motion.path
          d="M12 7.4L12 20.6"
          initial={false}
          animate={on ? { opacity: [0, 1, 1, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.08, 0.5, 0.92, 1] }}
        />
        <circle cx="15" cy="12.01" r="1.1" fill="currentColor" stroke="none" /><circle cx="15" cy="15.99" r="1.1" fill="currentColor" stroke="none" />
      </motion.g>
      <path d="M10.06 5.74Q9.8 3.6 8.6 2.7M13.94 5.74Q14.2 3.6 15.4 2.7" />
      <path d="M9.1 8.07A2.9 2.9 0 1 1 14.9 8.07A6.6 6.6 0 0 0 9.1 8.07Z" fill="currentColor" />

      </g>
    </svg>
  );
}
