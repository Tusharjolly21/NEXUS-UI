"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HairDryerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #fb7185. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Three streams of air blow out of the nozzle one after another while the dryer hums with a small shake. */
export function HairDryerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HairDryerIconProps) {
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
      <g transform="translate(0.79 -0.88)">

      <motion.g
        initial={false}
        animate={on ? { y: [0, 0.25, -0.25, 0.25, -0.25, 0.25, -0.25, 0] } : { y: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.4 7.09A0.8 0.8 0 0 1 6.84 6.38L9.83 4.88A0.8 0.8 0 0 1 10.19 4.8L17 4.8A3.6 3.6 0 0 1 20.6 8.4L20.6 8.6A3.6 3.6 0 0 1 17 12.2L10.19 12.2A0.8 0.8 0 0 1 9.83 12.12L6.84 10.62A0.8 0.8 0 0 1 6.4 9.91Z" />
        <path d="M12.4 12.2L11.4 19A2 2 0 0 0 15.4 19L16.4 12.2" />
      </motion.g>
      <g stroke={accent}>
        <motion.path
          d="M3.8 5.9H1.8"
          initial={false}
          animate={on ? { x: [0, -1.6, 1.6, 0], opacity: [1, 0, 0, 1] } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.7 / speed, delay: (0.0) / speed, times: [0, 0.45, 0.5, 1], ease: "easeOut" }}
        />
        <motion.path
          d="M3.8 8.5H1.8"
          initial={false}
          animate={on ? { x: [0, -1.6, 1.6, 0], opacity: [1, 0, 0, 1] } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.7 / speed, delay: (0.1) / speed, times: [0, 0.45, 0.5, 1], ease: "easeOut" }}
        />
        <motion.path
          d="M3.8 11.1H1.8"
          initial={false}
          animate={on ? { x: [0, -1.6, 1.6, 0], opacity: [1, 0, 0, 1] } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.7 / speed, delay: (0.2) / speed, times: [0, 0.45, 0.5, 1], ease: "easeOut" }}
        />
      </g>

      </g>
    </svg>
  );
}
