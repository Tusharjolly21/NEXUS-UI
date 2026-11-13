"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HarpIconProps = {
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

/** Four strings are plucked one after another and each shivers to a stop. */
export function HarpIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HarpIconProps) {
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
      <g transform="translate(-0.36 -0.06)">
      <motion.path
        d="M8.5 21.5Q8.5 12.13 8.5 2.77"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M8.5 21.5Q8.5 12.13 8.5 2.77", "M8.5 21.5Q10 12.13 8.5 2.77", "M8.5 21.5Q7.3 12.13 8.5 2.77", "M8.5 21.5Q9.3 12.13 8.5 2.77", "M8.5 21.5Q8.1 12.13 8.5 2.77", "M8.5 21.5Q8.5 12.13 8.5 2.77"] } : { d: "M8.5 21.5Q8.5 12.13 8.5 2.77" }}
        transition={{ duration: 0.7 / speed, delay: (0.08) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M11.5 19.26Q11.5 10.97 11.5 2.67"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M11.5 19.26Q11.5 10.97 11.5 2.67", "M11.5 19.26Q13 10.97 11.5 2.67", "M11.5 19.26Q10.3 10.97 11.5 2.67", "M11.5 19.26Q12.3 10.97 11.5 2.67", "M11.5 19.26Q11.1 10.97 11.5 2.67", "M11.5 19.26Q11.5 10.97 11.5 2.67"] } : { d: "M11.5 19.26Q11.5 10.97 11.5 2.67" }}
        transition={{ duration: 0.7 / speed, delay: (0.25) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M14.5 14.09Q14.5 8.72 14.5 3.35"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M14.5 14.09Q14.5 8.72 14.5 3.35", "M14.5 14.09Q16 8.72 14.5 3.35", "M14.5 14.09Q13.3 8.72 14.5 3.35", "M14.5 14.09Q15.3 8.72 14.5 3.35", "M14.5 14.09Q14.1 8.72 14.5 3.35", "M14.5 14.09Q14.5 8.72 14.5 3.35"] } : { d: "M14.5 14.09Q14.5 8.72 14.5 3.35" }}
        transition={{ duration: 0.7 / speed, delay: (0.42) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M17.5 8.93Q17.5 6.87 17.5 4.81"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M17.5 8.93Q17.5 6.87 17.5 4.81", "M17.5 8.93Q19 6.87 17.5 4.81", "M17.5 8.93Q16.3 6.87 17.5 4.81", "M17.5 8.93Q18.3 6.87 17.5 4.81", "M17.5 8.93Q17.1 6.87 17.5 4.81", "M17.5 8.93Q17.5 6.87 17.5 4.81"] } : { d: "M17.5 8.93Q17.5 6.87 17.5 4.81" }}
        transition={{ duration: 0.7 / speed, delay: (0.59) / speed, ease: "easeInOut" }}
      />
      <path d="M5.5 21.5V3.6Q12.5 0.8 19.2 6L10.2 21.5z" />
      </g>
    </svg>
  );
}
