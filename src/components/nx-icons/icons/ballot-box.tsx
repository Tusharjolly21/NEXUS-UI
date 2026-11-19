"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BallotBoxIconProps = {
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

/** A ticked ballot drops through the slot into the box with a thump, and a fresh one rises back up out of it. */
export function BallotBoxIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BallotBoxIconProps) {
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
      <g transform="translate(0 0.16)">

      <svg x="0" y="0" width="24" height="11" viewBox="0 0 24 11" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { y: [0, 9.2, 9.2, -0.5, 0] } : { y: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.32, 0.5, 0.82, 1], ease: ["easeIn", "linear", "easeOut", "easeInOut"] }}
        >
          <path d="M8.3 11L8.3 4.3A1.3 1.3 0 0 1 9.6 3L14.4 3A1.3 1.3 0 0 1 15.7 4.3L15.7 11" stroke={accent} />
          <path d="M10.75 7.3L11.75 8.3L13.25 6.0" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </svg>
      <motion.g
        style={{ originX: "50%", originY: "85.83%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1, 0.94, 1.02, 1], scaleX: [1, 1, 1.03, 0.995, 1] } : { scaleY: 1, scaleX: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.38, 0.48, 0.58], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.8 13A2 2 0 0 1 5.8 11L18.2 11A2 2 0 0 1 20.2 13L20.2 18.6A2 2 0 0 1 18.2 20.6L5.8 20.6A2 2 0 0 1 3.8 18.6Z" />
      </motion.g>
      </g>
    </svg>
  );
}
