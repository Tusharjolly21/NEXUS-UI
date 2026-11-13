"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ClothesHangerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #a78bfa. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The hanger swings like a pendulum from its hook and settles back to rest. */
export function ClothesHangerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ClothesHangerIconProps) {
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
      <g transform="translate(0 0.92)">

      <motion.g
        style={{ originX: "39.17%", originY: "20%" }}
        initial={false}
        animate={on ? { rotate: [0, 12, -10, 6.5, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.44, 0.66, 0.84, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 10.6V7.4A2.6 2.6 0 1 0 7.56 9.24" stroke={accent} />
        <path d="M12 10.6L17.4 14.5A1.6 1.6 0 0 1 16.46 17.4L7.54 17.4A1.6 1.6 0 0 1 6.6 14.5Z" />
      </motion.g>

      </g>
    </svg>
  );
}
