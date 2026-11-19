"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WhistleIconProps = {
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

/** The whistle trembles with a blast as the pea whirls round inside and sound lines burst from the top. */
export function WhistleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WhistleIconProps) {
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
      <g transform="translate(-0.21 -2.21)">

      <motion.path
        d="M9.62 7.23L8.59 5.76M11 6.8L11 5M12.38 7.23L13.41 5.76"
        initial={false}
        animate={on ? { opacity: [0, 1, 1, 0], pathLength: [0, 1, 1, 1] } : { opacity: 0, pathLength: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.75, 1], ease: "easeOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -0.35, 0.35, -0.35, 0.35, -0.25, 0.25, 0] } : { x: 0 }}
        transition={{ duration: 0.8 / speed, ease: "linear" }}
      >
        <motion.g
          style={{ originX: "38.33%", originY: "59.17%" }}
          initial={false}
          animate={on ? { rotate: [0, 720, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.995, 1], ease: ["easeInOut", "linear"] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="9.2" cy="15.2" r="1.5" fill={accent} stroke="none" />
        </motion.g>
        <path d="M9.2 9.2H19.2A1 1 0 0 1 20.2 10.2V11.6A1 1 0 0 1 19.2 12.6H13.94A5 5 0 1 1 9.2 9.2Z" />
      </motion.g>

      </g>
    </svg>
  );
}
