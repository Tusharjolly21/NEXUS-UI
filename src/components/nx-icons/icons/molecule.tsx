"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MoleculeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The outer atoms stretch away from the centre on their bonds and spring back one after another while the core glows. */
export function MoleculeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MoleculeIconProps) {
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
      <g transform="translate(0 -2)">

      <motion.circle
        cx="12" cy="12" r="2.6" fill={accent} stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { opacity: [1, 0.55, 1, 0.7, 1] } : { opacity: 1 }}
        transition={{ duration: 0.96 / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
      />
      <circle cx="12" cy="12" r="2.6" />
      <motion.path
        d="M9.75 10.7L5.07 8"
        initial={false}
        animate={on ? { d: ["M9.75 10.7L5.07 8", "M9.75 10.7L4.29 7.55", "M9.75 10.7L5.5 8.25", "M9.75 10.7L4.77 7.83", "M9.75 10.7L5.07 8"] } : { d: "M9.75 10.7L5.07 8" }}
        transition={{ duration: 0.8 / speed, delay: (0) / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -0.78, 0.43, -0.3, 0], y: [0, -0.45, 0.25, -0.17, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8 / speed, delay: (0) / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
      >
        <circle cx="5.07" cy="8" r="2.3" fill="currentColor" stroke="none" />
      </motion.g>
      <motion.path
        d="M14.25 10.7L18.93 8"
        initial={false}
        animate={on ? { d: ["M14.25 10.7L18.93 8", "M14.25 10.7L19.71 7.55", "M14.25 10.7L18.5 8.25", "M14.25 10.7L19.23 7.83", "M14.25 10.7L18.93 8"] } : { d: "M14.25 10.7L18.93 8" }}
        transition={{ duration: 0.8 / speed, delay: (0.08) / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 0.78, -0.43, 0.3, 0], y: [0, -0.45, 0.25, -0.17, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8 / speed, delay: (0.08) / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
      >
        <circle cx="18.93" cy="8" r="2.3" fill="currentColor" stroke="none" />
      </motion.g>
      <motion.path
        d="M12 14.6L12 20"
        initial={false}
        animate={on ? { d: ["M12 14.6L12 20", "M12 14.6L12 20.9", "M12 14.6L12 19.5", "M12 14.6L12 20.35", "M12 14.6L12 20"] } : { d: "M12 14.6L12 20" }}
        transition={{ duration: 0.8 / speed, delay: (0.16) / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 0, 0, 0, 0], y: [0, 0.9, -0.5, 0.35, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.8 / speed, delay: (0.16) / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
      >
        <circle cx="12" cy="20" r="2.3" fill="currentColor" stroke="none" />
      </motion.g>
      </g>
    </svg>
  );
}
