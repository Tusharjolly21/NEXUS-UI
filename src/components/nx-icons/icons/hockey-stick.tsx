"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HockeyStickIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The stick winds back and slaps the puck, which shoots out of the frame and slides back into place. */
export function HockeyStickIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HockeyStickIconProps) {
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
      <g transform="translate(-0.88 0.58)">

      <motion.g
        style={{ originX: "23.33%", originY: "14.17%" }}
        initial={false}
        animate={on ? { rotate: [0, 16, -5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.5, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4.38 4.77A0.9 0.9 0 0 1 4.94 3.63L6.26 3.17A0.9 0.9 0 0 1 7.41 3.73L11.48 15.62A1 1 0 0 0 12.42 16.3L14.11 16.3A1.69 1.69 0 0 1 15.8 17.99L15.8 18.01A1.69 1.69 0 0 1 14.11 19.7L10.49 19.7A1.4 1.4 0 0 1 9.17 18.75Z" />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, 9, 9, 0, 0, 0], opacity: [1, 1, 1, 0, 0, 0, 1] } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.47, 0.62, 0.63, 0.64, 0.75, 1], ease: "easeOut" }}
        >
          <path d="M18.6 19.2A0.5 0.5 0 0 1 19.1 18.7L20.9 18.7A0.5 0.5 0 0 1 21.4 19.2L21.4 19.2A0.5 0.5 0 0 1 20.9 19.7L19.1 19.7A0.5 0.5 0 0 1 18.6 19.2Z" fill={accent} stroke={accent} />
        </motion.g>
      </svg>

      </g>
    </svg>
  );
}
