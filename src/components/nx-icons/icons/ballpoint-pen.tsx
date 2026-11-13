"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BallpointPenIconProps = {
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

/** A click pen: the button is pressed and the tip pushes out, then a second click draws it back in. */
export function BallpointPenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BallpointPenIconProps) {
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
      <g transform="translate(0.42 0.29)">

      <motion.path
        d="M10.53 20.2h.01"
        stroke={accent}
        strokeWidth={2}
        initial={false}
        animate={on ? { y: [0, 0, 1.2, 1.2, 0, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.2, 0.72, 0.8, 1], ease: "easeOut" }}
      />
      <path d="M12.73 6.5H15.33V13.5H12.73" strokeWidth={strokeWidth * 0.5} />
      <path d="M8.33 15L9.73 19H11.33L12.73 15Z" fill="currentColor" />
      <path d="M9.33 5H11.73A1 1 0 0 1 12.73 6V15H8.33V6A1 1 0 0 1 9.33 5Z" />
      <motion.path
        d="M10.53 3.2V5"
        initial={false}
        animate={on ? { y: [0, 0, 1.2, 0, 0, 1.2, 0, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.1, 0.16, 0.24, 0.7, 0.76, 0.84, 1], ease: "easeOut" }}
      />
      </g>
    </svg>
  );
}
