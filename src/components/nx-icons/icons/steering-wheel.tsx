"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SteeringWheelIconProps = {
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

/** A steering wheel that turns hard left, then right, and settles straight again. */
export function SteeringWheelIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SteeringWheelIconProps) {
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
        animate={on ? { rotate: [0, -80, 65, -24, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 2.5V6.2" stroke={accent} />
        <circle cx="12" cy="12" r="9.5" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M12 14.6L12 21.5M9.75 10.7L3.77 7.25M14.25 10.7L20.23 7.25" />
      </motion.g>
    </svg>
  );
}
