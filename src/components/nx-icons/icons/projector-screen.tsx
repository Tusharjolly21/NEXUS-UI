"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ProjectorScreenIconProps = {
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

/** The roll-down screen is pulled up into its case, then drops back with a little bounce and redraws its chart bars. */
export function ProjectorScreenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ProjectorScreenIconProps) {
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
      <motion.path
        d="M8.5 12.5V8.8"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 0.01, 0.01, 1], opacity: [1, 0, 0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 1 / speed, delay: (on ? 0 : 0) / speed, times: [0, 0.2, 0.62, 0.92], ease: "easeInOut" }}
      />
      <motion.path
        d="M12 12.5V7.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 0.01, 0.01, 1], opacity: [1, 0, 0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 1 / speed, delay: (on ? 0.05 : 0) / speed, times: [0, 0.2, 0.62, 0.92], ease: "easeInOut" }}
      />
      <motion.path
        d="M15.5 12.5V10.2"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 0.01, 0.01, 1], opacity: [1, 0, 0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 1 / speed, delay: (on ? 0.1 : 0) / speed, times: [0, 0.2, 0.62, 0.92], ease: "easeInOut" }}
      />
      <motion.path
        d="M4.5 3.5V15.5H19.5V3.5"
        initial={false}
        animate={on ? { d: ["M4.5 3.5V15.5H19.5V3.5", "M4.5 3.5V6.5H19.5V3.5", "M4.5 3.5V6.5H19.5V3.5", "M4.5 3.5V16.2H19.5V3.5", "M4.5 3.5V15.5H19.5V3.5"] } : { d: "M4.5 3.5V15.5H19.5V3.5" }}
        transition={{ duration: 1 / speed, times: [0, 0.25, 0.35, 0.75, 1], ease: ["easeIn", "linear", "easeOut", "easeInOut"] }}
      />
      <motion.g
        initial={false}
        animate={on ? { y: [0, -9, -9, 0.7, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.25, 0.35, 0.75, 1], ease: ["easeIn", "linear", "easeOut", "easeInOut"] }}
      >
        <path d="M12 15.5V19" />
        <path d="M12 20h.01" strokeWidth={3} />
      </motion.g>
      <path d="M2.5 3.5H21.5" />
    </svg>
  );
}
