"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DrumIconProps = {
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

/** Two drumsticks roll alternately onto a snare drum, each hit sending a ripple across the skin. */
export function DrumIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DrumIconProps) {
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
      <g transform="translate(0 -0.45)">
      <motion.g
        style={{ originX: "3.2px", originY: "3.6px" }}
        initial={false}
        animate={on ? { rotate: [0, -17, 0, -17, 0, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.22, 0.38, 0.52, 0.6, 0.8], ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeInOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.2 3.6L8.5 9.16" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "20.8px", originY: "3.6px" }}
        initial={false}
        animate={on ? { rotate: [0, 0, 17, 0, 17, 0, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.1, 0.26, 0.37, 0.55, 0.67, 0.75, 0.92], ease: ["linear", "easeOut", "easeIn", "easeOut", "easeIn", "easeOut", "easeInOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M20.8 3.6L15.5 9.16" stroke={accent} />
      </motion.g>
      <ellipse cx="12" cy="11.5" rx="8" ry="2.6" />
      <path d="M4 11.5v7.2a8 2.6 0 0 0 16 0v-7.2" />
      <path d="M8 13.75V20.95" />
      <path d="M12 14.1V21.3" />
      <path d="M16 13.75V20.95" />
      <motion.ellipse
        cx="12"
        cy="11.5"
        rx="4.6"
        ry="0.7"
        strokeWidth={strokeWidth * 0.6}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { opacity: [0, 0.9, 0, 0.9, 0, 0.9, 0, 0.9, 0, 0], scale: [0.3, 0.3, 1.1, 0.3, 1.1, 0.3, 1.1, 0.3, 1.1, 1.1] } : { opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.22, 0.34, 0.37, 0.49, 0.52, 0.64, 0.67, 0.85, 1], ease: "linear" }}
      />
      </g>
    </svg>
  );
}
