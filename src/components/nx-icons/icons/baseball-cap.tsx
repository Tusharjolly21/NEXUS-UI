"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BaseballCapIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The cap tips forward on its peak, bounces back past level and settles with its button bobbing. */
export function BaseballCapIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BaseballCapIconProps) {
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
        style={{ originX: "18.75%", originY: "58.458%" }}
        initial={false}
        animate={on ? { rotate: [0, 11, -3, 1.5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M2.75 14.03 A7.25 8 0 0 1 17.25 14.03" />
        <path d="M10 6.03 V14.03 M10 6.03 A3.625 8 0 0 1 13.625 14.03 M10 6.03 A3.625 8 0 0 0 6.375 14.03" strokeWidth={strokeWidth * 0.75} />
        <path d="M2.75 14.03H17.25" />
        <path d="M17.25 14.03 C20 14.03 21.5 15.43 21.5 17.93 C18.2 19.03 14.2 17.83 12.6 14.03" />
        <circle cx="10" cy="6.03" r="1.3" fill={accent} stroke="none" />
      </motion.g>
    </svg>
  );
}
