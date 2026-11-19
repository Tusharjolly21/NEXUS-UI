"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LoveLetterIconProps = {
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

/** The heart seal lifts off the envelope flap, beats once in the air and presses back down as the envelope bounces. */
export function LoveLetterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LoveLetterIconProps) {
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
        animate={on ? { y: [0, 0, 0, 0.5, 0] } : { y: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.6, 0.74, 0.84, 1], ease: "easeInOut" }}
      >
        <path d="M3 8A1.8 1.8 0 0 1 4.8 6.2L19.2 6.2A1.8 1.8 0 0 1 21 8L21 16A1.8 1.8 0 0 1 19.2 17.8L4.8 17.8A1.8 1.8 0 0 1 3 16Z" />
        <path d="M3.53 6.73L12 12.6L20.47 6.73" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, -3.2, -3.2, 0.5, 0] } : { y: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.3, 0.58, 0.76, 1], ease: "easeInOut" }}
      >
        <motion.path
          d="M12 15.16L9.95 13.11A1.45 1.45 0 0 1 12 11.06A1.45 1.45 0 0 1 14.05 13.11Z"
          fill={accent}
          stroke={accent}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.08, 1.3, 1, 1], rotate: [0, -8, 6, 0, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.95 / speed, times: [0, 0.3, 0.44, 0.6, 1], ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
