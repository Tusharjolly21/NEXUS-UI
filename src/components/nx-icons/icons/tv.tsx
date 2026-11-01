"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TvIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A retro television that fizzes with static while its antenna wobbles, then tunes in a picture. */
export function TvIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TvIconProps) {
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
      <motion.path
        d="M8 3.6 12 7.6 16 3.6"
        stroke={accent}
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -12, 10, -6, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
      <rect x="3" y="8" width="18" height="12.5" rx="2.6" />
      <motion.path
        d="M7 11.5h10M7 14.5h10M7 17.5h10"
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { opacity: [0, 1, 0.3, 1, 0, 0] } : { opacity: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.15, 0.3, 0.5, 0.65, 1] }}
      />
      <motion.path
        d="M10.6 11.8 14.2 14l-3.6 2.2z"
        fill={accent}
        stroke={accent}
        strokeWidth={1.2}
        initial={false}
        animate={on ? { opacity: [0, 0, 0, 0, 1, 1] } : { opacity: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.4, 0.5, 0.6, 0.7, 1] }}
      />
    </svg>
  );
}
