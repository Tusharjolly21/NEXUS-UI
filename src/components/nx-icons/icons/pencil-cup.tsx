"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PencilCupIconProps = {
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

/** Three pencils rattle in their cup, each leaning a different way before they settle upright. */
export function PencilCupIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PencilCupIconProps) {
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
        style={{ originX: "35.417%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 8, -8, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.1 6.37L6.32 3.27" stroke={accent} />
        <path d="M8.5 12.0L7.1 6.37" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -6, 6, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 6.2L12 3" stroke={accent} />
        <path d="M12 12.0L12 6.2" />
      </motion.g>
      <motion.g
        style={{ originX: "64.583%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 8, -8, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.05 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M16.82 7.39L17.71 4.31" stroke={accent} />
        <path d="M15.5 12.0L16.82 7.39" />
      </motion.g>
      <motion.path
        d="M5 12H19L17.3 21H6.7Z"
        initial={false}
        animate={on ? { x: [0, 0.4, -0.4, 0.3, 0] } : { x: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
