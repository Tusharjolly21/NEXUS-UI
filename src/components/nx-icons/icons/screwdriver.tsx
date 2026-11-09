"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ScrewdriverIconProps = {
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

/** A screwdriver whose ribbed handle rolls round while the screw beside it winds down into the wood. */
export function ScrewdriverIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ScrewdriverIconProps) {
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
      <svg x="0" y="0" width="24" height="20.61" viewBox="0 0 24 20.61" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { y: [0, 0, 0.8, 0.8, 1.6, 1.6, 2.4, 2.4, 0, 0] } : { y: 0 }}
          transition={{ duration: 1.2 / speed, times: [0, 0.0417, 0.125, 0.2083, 0.2917, 0.375, 0.4583, 0.5833, 0.9167, 1], ease: "easeInOut" }}
        >
          <rect x="12.13" y="7.91" width="6.4" height="2.8" rx="1.2" fill={accent} stroke="none" />
          <path d="M16.23 10.71 L17.13 11.79 L16.23 13.11 L17.13 14.19 L16.23 15.51 L17.13 16.59 L16.23 17.91 L17.13 18.99 L16.23 20.31 L17.13 21.39 L16.23 22.71 L13.53 22.59 L14.43 21.51 L13.53 20.19 L14.43 19.11 L13.53 17.79 L14.43 16.71 L13.53 15.39 L14.43 14.31 L13.53 12.99 L14.43 11.91 L14.43 10.71z" fill={accent} stroke="none" />
        </motion.g>
      </svg>
      <path d="M11.13 20.61 H19.53" />
      <rect x="3.53" y="2.41" width="4.4" height="8.6" rx="2" fill="currentColor" stroke="none" />
      <path d="M5.73 11.01 V20.61" />
      <svg x="3.93" y="3.71" width="3.6" height="6" viewBox="0 0 3.6 6" overflow="hidden">
        <motion.g
          stroke={accent}
          strokeWidth={1}
          strokeLinecap="butt"
          initial={false}
          animate={on ? { y: [0, 0, 2.4, 2.4, 4.8, 4.8, 7.2, 7.2, 0, 0] } : { y: 0 }}
          transition={{ duration: 1.2 / speed, times: [0, 0.0417, 0.125, 0.2083, 0.2917, 0.375, 0.4583, 0.5833, 0.9167, 1], ease: "easeInOut" }}
        >
          <path d="M-0.8 -0.4 L4.4 -3.2" /><path d="M-0.8 2 L4.4 -0.8" /><path d="M-0.8 4.4 L4.4 1.6" /><path d="M-0.8 6.8 L4.4 4" /><path d="M-0.8 9.2 L4.4 6.4" /><path d="M-0.8 11.6 L4.4 8.8" />
        </motion.g>
      </svg>
    </svg>
  );
}
