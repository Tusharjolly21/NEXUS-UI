"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ThermometerIconProps = {
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

/** A thermometer whose mercury shoots up the tube, overshoots and settles. */
export function ThermometerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ThermometerIconProps) {
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
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z" />
      <path d="M16.8 7.5h1.6M16.8 10.5h1.2" />
      <circle cx="12" cy="17" r="1.6" fill={accent} stroke="none" />
      <motion.path
        d="M12 17V9.4"
        stroke={accent}
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [0.2, 1, 0.85, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.5, 0.7, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
