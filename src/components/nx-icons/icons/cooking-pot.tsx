"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CookingPotIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #f97316. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The lid rattles up and down as steam wisps puff out from both sides of it. */
export function CookingPotIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CookingPotIconProps) {
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
      <g transform="translate(0 -0.83)">

      <path d="M3.8 10.6H20.2" />
      <path d="M5.5 10.6V18.6A2 2 0 0 0 7.5 20.6H16.5A2 2 0 0 0 18.5 18.6V10.6" />
      <path d="M5.5 14.2H2.8M18.5 14.2H21.2" />
      <motion.g
        initial={false}
        animate={on ? { y: [0, -1.5, 0, -1.1, 0, -0.6, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.18, 0.34, 0.52, 0.68, 0.84, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5.5 10.6C5.5 5.4 18.5 5.4 18.5 10.6" />
        <path d="M12 6.7 V5" />
      </motion.g>
        <motion.path
          d="M8 4.66q1 -0.6 0 -1.2t0 -1.2"
          stroke={accent}
          initial={false}
          animate={on ? { y: [0, -0.3, -0.4], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.6 / speed, delay: (0.15) / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M16 4.66q1 -0.6 0 -1.2t0 -1.2"
          stroke={accent}
          initial={false}
          animate={on ? { y: [0, -0.3, -0.4], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.6 / speed, delay: (0.27) / speed, ease: "easeOut" }}
        />

      </g>
    </svg>
  );
}
