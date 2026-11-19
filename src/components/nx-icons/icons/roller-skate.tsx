"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RollerSkateIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The roller skate rolls forward on its wheels, rocks back on its heel and rolls home. */
export function RollerSkateIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RollerSkateIconProps) {
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
      <g transform="translate(-0.54 -0.17)">

      <motion.g
        initial={false}
        animate={on ? { x: [0, 2, -1.2, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
      >
        <motion.g
          style={{ originX: "31.67%", originY: "87.5%" }}
          initial={false}
          animate={on ? { rotate: [0, 0, -6, 0, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.5, 0.7, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M5.33 4.33A1 1 0 0 1 6.33 3.4L10.12 3.4A1 1 0 0 1 11.12 4.27L11.73 8.85A0.8 0.8 0 0 0 12.35 9.52L16.85 10.52A2.4 2.4 0 0 1 17.51 10.77L19.48 11.88A1.8 1.8 0 0 1 20.4 13.45L20.4 13.4A1 1 0 0 1 19.4 14.4L5.68 14.4A1 1 0 0 1 4.68 13.33Z" />
          <path d="M11.35 6H8.55M11.71 8.7H8.91" />
          <circle cx="7.6" cy="18.7" r="2.3" stroke={accent} />
          <circle cx="17.4" cy="18.7" r="2.3" stroke={accent} />
        </motion.g>
      </motion.g>

      </g>
    </svg>
  );
}
