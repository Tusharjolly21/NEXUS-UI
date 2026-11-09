"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SkateboardIconProps = {
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

/** A skateboard that presses its tail down so the nose lifts, then ollies into the air and lands on its wheels. */
export function SkateboardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SkateboardIconProps) {
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
        animate={on ? { y: [0, 0, -2.3, 0, 0.35, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.5, 0.74, 0.8, 1], ease: ["linear", "easeOut", "easeIn", "easeOut", "easeInOut"] }}
      >
        <motion.g
          style={{ originX: "70.83%", originY: "71.46%" }}
          initial={false}
          animate={on ? { rotate: [0, 11, 4, -2, 0, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.2, 0.36, 0.55, 0.74, 1], ease: ["easeIn", "easeOut", "easeInOut", "easeOut", "linear"] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M3 7.85C3.35 9.45 4.3 10.35 6.2 10.35H17.8C19.7 10.35 20.65 9.45 21 7.85" />
          <path d="M7 10.35V14.75M17 10.35V14.75" />
          <circle cx="7" cy="14.75" r="2.4" fill={accent} stroke="none" />
          <circle cx="17" cy="14.75" r="2.4" fill={accent} stroke="none" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
