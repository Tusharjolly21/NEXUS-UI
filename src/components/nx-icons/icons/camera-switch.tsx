"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CameraSwitchIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The camera body turns as if flipping to the other lens while the two arrows inside sweep half a turn around. */
export function CameraSwitchIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CameraSwitchIconProps) {
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
      <g transform="translate(0 -0.08)">

      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.86, 1.03, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.35, 0.72, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M2.6 9.3A2.3 2.3 0 0 1 4.9 7L7.79 7A0.8 0.8 0 0 0 8.51 6.54L9.23 4.98A1 1 0 0 1 10.14 4.4L13.86 4.4A1 1 0 0 1 14.77 4.98L15.49 6.54A0.8 0.8 0 0 0 16.21 7L19.1 7A2.3 2.3 0 0 1 21.4 9.3L21.4 17.5A2.3 2.3 0 0 1 19.1 19.8L4.9 19.8A2.3 2.3 0 0 1 2.6 17.5Z" />
      </motion.g>
      <motion.g
        stroke={accent}
        style={{ originX: "50%", originY: "55.83%" }}
        initial={false}
        animate={on ? { rotate: [0, 196, 176, 180] } : { rotate: 0, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.85 / speed, times: [0, 0.55, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.62 12.17A3.6 3.6 0 0 1 15.26 11.88M15.94 9.68L15.26 11.88L13.15 10.98M15.38 14.63A3.6 3.6 0 0 1 8.74 14.92M8.06 17.12L8.74 14.92L10.85 15.82" />
      </motion.g>
      </g>
    </svg>
  );
}
