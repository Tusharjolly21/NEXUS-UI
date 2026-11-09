"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SandwichIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A sandwich whose layers lift apart one after another and settle back down. */
export function SandwichIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SandwichIconProps) {
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
        animate={on ? { y: [0, -2.4, 0.35, 0] } : { y: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0) / speed, times: [0, 0.45, 0.8, 1], ease: "easeInOut" }}
      >
        <path d="M12 4L15.41 9.8H8.59z" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, -2.0, 0.35, 0] } : { y: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.17) / speed, times: [0, 0.45, 0.8, 1], ease: "easeInOut" }}
      >
        <path d="M8.59 9.8H15.41L19.4 16.6H4.6z" />
        <path d="M6.65 13.1Q7.54 14.3 8.44 13.1Q9.33 11.9 10.22 13.1Q11.11 14.3 12 13.1Q12.89 11.9 13.78 13.1Q14.67 14.3 15.56 13.1Q16.46 11.9 17.35 13.1" stroke={accent} />
      </motion.g>
      <path d="M4.6 16.6H19.4L21.4 20H2.6z" />
    </svg>
  );
}
