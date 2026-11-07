"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LighthouseIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A lighthouse whose lantern glows while its beam sweeps out as two rays, left and right in turn. */
export function LighthouseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LighthouseIconProps) {
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
      <path d="M8.9 10 7.2 21.5H16.8L15.1 10" />
      <path d="M8.33 13.83H15.67M7.77 17.67H16.23" stroke={accent} />
      <path d="M7 10H17" />
      <path d="M9.4 10V5.4H14.6V10M8.8 5.4 12 2.6 15.2 5.4Z" />
      <motion.circle
        cx="12"
        cy="7.7"
        r="1.1"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.6, 1, 1.6, 1], opacity: [1, 0.7, 1, 0.7, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.95 / speed }}
      />
      <motion.path
        d="M6.6 7.7H2.6"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 1, 1, 0.1, 0.1, 1], opacity: [1, 1, 1, 0.4, 0.4, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.15, 0.4, 0.6, 0.85, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M17.4 7.7H21.4"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 0.1, 0.1, 1, 1, 1], opacity: [1, 0.4, 0.4, 1, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.15, 0.4, 0.6, 0.85, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
