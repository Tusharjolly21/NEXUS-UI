"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MountainIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two peaks that rise from the ground, the snow line drawing across and a glint at the summit. */
export function MountainIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MountainIconProps) {
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
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [0.7, 1.06, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      >
        <motion.path
          d="M8.6 11.3l1.3 1.3 1.4-1.4"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.35 : 0) / speed }}
        />
        <path d="M2.5 19.5 9.5 7l4 6.5 2-3 5.5 9z" />
      </motion.g>
      <motion.path
        d="M9.5 3.2v1.6M8.7 4h1.6"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.5, 0.7, 1] }}
      />
    </svg>
  );
}
