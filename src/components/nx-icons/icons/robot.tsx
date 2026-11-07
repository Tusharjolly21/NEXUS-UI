"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RobotIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The robot head tilts side to side while its eyes scan left and right and the antenna blinks twice. */
export function RobotIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RobotIconProps) {
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
        style={{ originX: "50%", originY: "60%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 5, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 8.5V5.3" />
        <motion.circle
          cx="12"
          cy="3.9"
          r="1.4"
          stroke={accent}
          strokeWidth={1}
          style={{ originX: "50%", originY: "16.25%" }}
          initial={false}
          animate={on ? { scale: [1, 1.7, 1.7, 1, 1.7, 1.7], opacity: [0, 0.7, 0, 0, 0.7, 0] } : { scale: 1, opacity: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.05) / speed, times: [0, 0.2, 0.45, 0.5, 0.7, 0.95], ease: "easeOut" }}
        />
        <motion.circle
          cx="12"
          cy="3.9"
          r="1.4"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { opacity: [1, 0.15, 1, 0.15, 1] } : { opacity: 1 }}
          transition={{ duration: 0.8 / speed, delay: (0.05) / speed, times: [0, 0.2, 0.5, 0.7, 1] }}
        />
        <path d="M4.5 14.5H2.5M19.5 14.5H21.5" />
        <rect x="4.5" y="8.5" width="15" height="12" rx="3.5" />
        <motion.g
          initial={false}
          animate={on ? { x: [0, -1.4, 1.4, -1.4, 0] } : { x: 0 }}
          transition={{ duration: 1 / speed, ease: "easeInOut" }}
        >
          <circle cx="8.8" cy="13.2" r="1.5" fill={accent} stroke="none" />
          <circle cx="15.2" cy="13.2" r="1.5" fill={accent} stroke="none" />
        </motion.g>
        <path d="M9.5 16.3V18M12 16.3V18M14.5 16.3V18" strokeWidth={1.4} />
      </motion.g>
    </svg>
  );
}
