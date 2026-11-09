"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WashingMachineIconProps = {
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

/** The machine shudders as the drum spins a full turn with the suds sloshing and bubbles bobbing behind the porthole glass. */
export function WashingMachineIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WashingMachineIconProps) {
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
        animate={on ? { x: [0, 0.3, -0.3, 0.25, -0.25, 0.12, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, delay: (0.1) / speed, ease: "linear" }}
      >
        <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
        <path d="M4 7H20" />
        <circle cx="7.5" cy="4.75" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="4.75" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="18" cy="4.75" r="0.9" fill="currentColor" stroke="none" />
        <svg x="8.5" y="10.8" width="7" height="7" viewBox="8.5 10.8 7 7" overflow="hidden">
          <motion.g
            style={{ originX: "50%", originY: "59.583%" }}
            initial={false}
            animate={on ? { rotate: [0, 360, 0] } : { rotate: 0 }}
            transition={{ duration: 0.8 / speed, delay: (0.1) / speed, times: [0, 0.999, 1], ease: "easeInOut" }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <g transform="translate(12 15.6)">
              <motion.path
                d="M-10.5 0 q0.75 -1 1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0 t1.5 0"
                stroke={accent}
                strokeWidth={strokeWidth * 0.75}
                initial={false}
                animate={on ? { x: [0, -2.2, 2.2, -1.2, 0] } : { x: 0 }}
                transition={{ duration: 1.0 / speed, delay: (0.1) / speed, ease: "easeInOut" }}
              />
            </g>
            <motion.circle
              cx="10.8"
              cy="12.8"
              r="0.8"
              fill={accent}
              stroke="none"
              initial={false}
              animate={on ? { y: [0, -0.9, 0.5, -0.4, 0] } : { y: 0 }}
              transition={{ duration: 0.9 / speed, delay: (0.3) / speed, ease: "easeInOut" }}
            />
            <motion.circle
              cx="13.2"
              cy="12.1"
              r="0.8"
              fill={accent}
              stroke="none"
              initial={false}
              animate={on ? { y: [0, 0.7, -0.8, 0.3, 0] } : { y: 0 }}
              transition={{ duration: 0.9 / speed, delay: (0.3) / speed, ease: "easeInOut" }}
            />
          </motion.g>
        </svg>
        <circle cx="12" cy="14.3" r="4.5" />
      </motion.g>
    </svg>
  );
}
