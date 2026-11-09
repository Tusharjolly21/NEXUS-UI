"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AcornIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An acorn that rocks on its tip while a leaf drops from its stalk and a new one grows back. */
export function AcornIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AcornIconProps) {
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
        style={{ originX: "50%", originY: "88.04%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 7, -4, 2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5 10.73A7 5.6 0 0 1 19 10.73Z" />
        <path d="M6.4 10.73C6 15.73 8.8 19.53 12 21.13C15.2 19.53 18 15.73 17.6 10.73" />
        <path d="M12 5.13L12 3.13" />
        <path d="M7.6 10.73L13.13 5.2M7.6 10.73L5.51 8.64M12 10.73L16.37 6.36M12 10.73L7.63 6.36M16.4 10.73L18.49 8.64M16.4 10.73L10.87 5.2" strokeWidth={strokeWidth * 0.5} />
        <motion.g
          style={{ originX: "50%", originY: "13.46%" }}
          initial={false}
          animate={on ? { x: [0, 0.3, 6.6, 8.4, 8.2, 0, 0], y: [0, 0.4, 2.8, 9.0, 16.0, 0, 0], rotate: [0, 12, 52, 84, 70, 0, 0], scale: [1, 1, 1, 1, 1, 0, 1], opacity: [1, 1, 1, 1, 0, 0, 1] } : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.14, 0.34, 0.56, 0.76, 0.8, 1], ease: "linear" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 3.13C13 1.93 15.4 1.43 17.4 2.33C16.2 3.93 13.6 4.33 12 3.13Z" fill={accent} stroke="none" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
