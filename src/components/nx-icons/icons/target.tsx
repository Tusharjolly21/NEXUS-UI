"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TargetIconProps = {
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

/** A dart flies into the target and sticks in the bullseye as a ring of impact spreads out. */
export function TargetIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TargetIconProps) {
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
        initial={false}
        animate={on ? { x: [5, -0.8, 0], y: [-5, 0.8, 0], opacity: [0, 1, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.3 / speed, ease: "easeOut" }}
      >
        <path d="M12 12 19.2 4.8M16.3 4.2h3.5v3.5" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 0.94, 1.03, 1] } : { scale: 1 }}
        transition={{ duration: 0.7 / speed, times: [0, 0.35, 0.5, 0.7, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5.2" />
        <circle cx="12" cy="12" r="1.6" fill={accent} stroke="none" />
      </motion.g>
      <motion.circle
        cx="12"
        cy="12"
        r="2"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0.5, 2.6], opacity: [0.9, 0] } : { opacity: 0, scale: 0.5 }}
        transition={on ? { duration: 0.4 / speed, delay: (0.3) / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
      />
    </svg>
  );
}
