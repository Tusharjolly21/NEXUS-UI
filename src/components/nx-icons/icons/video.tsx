"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VideoIconProps = {
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

/** A video camera whose lens zooms out and whose red record light blinks twice. */
export function VideoIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VideoIconProps) {
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
      <rect x="3" y="6.5" width="12.5" height="11" rx="2.5" />
      <motion.path
        d="M15.5 10.5 21 7.5v9l-5.5-3"
        style={{ originX: "0%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [0.4, 1.15, 1], opacity: [0.4, 1, 1] } : { scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.4 / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="6.8"
        cy="10.2"
        r="1.4"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { opacity: [1, 1, 0.15, 1, 0.15, 1] } : { opacity: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.25, 0.45, 0.6, 0.8, 1] }}
      />
    </svg>
  );
}
