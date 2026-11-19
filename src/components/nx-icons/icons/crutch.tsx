"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CrutchIconProps = {
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

/** The crutch swings forward in a step and plants its rubber tip with a little squash before standing still. */
export function CrutchIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CrutchIconProps) {
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
      <g transform="translate(0 0.26)">

      <motion.g
        style={{ originX: "50%", originY: "90.83%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 3.5, -1, 0], y: [0, -0.6, 0, 0, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.35, 0.6, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M10.6 19.7A0.5 0.5 0 0 1 11.1 19.2L12.9 19.2A0.5 0.5 0 0 1 13.4 19.7L13.4 20.8A1 1 0 0 1 12.4 21.8L11.6 21.8A1 1 0 0 1 10.6 20.8Z"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1, 0.72, 1.06, 1], scaleX: [1, 1, 1.16, 0.97, 1] } : { scaleY: 1, scaleX: 1 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.55, 0.64, 0.78, 1], ease: "easeInOut" }}
        />
        <path d="M9.1 3.54C8.8 9.14 10 15.3 12 16.8C14 15.3 15.2 9.14 14.9 3.54" />
        <path d="M15.64 3.38A16.2 16.2 0 0 1 8.36 3.38" strokeWidth={strokeWidth * 1.7} />
        <path d="M9.52 10.83H14.48" />
        <path d="M12 16.8V19.2" strokeLinecap="butt" />
      </motion.g>
      </g>
    </svg>
  );
}
