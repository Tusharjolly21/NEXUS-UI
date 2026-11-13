"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TimelineIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Three nodes pop in down the line, each joined to the next by a connector that draws itself. */
export function TimelineIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TimelineIconProps) {
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
      <g transform="translate(-0.17 0)">

      <motion.path
        d="M5.5 6.4V10.4"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.2 / speed, delay: (on ? 0.12 : 0) / speed, ease: "linear", opacity: { duration: 0.01 / speed, delay: (on ? 0.12 : 0) / speed } }}
      />
      <motion.path
        d="M5.5 13.6V17.6"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.2 / speed, delay: (on ? 0.42 : 0) / speed, ease: "linear", opacity: { duration: 0.01 / speed, delay: (on ? 0.42 : 0) / speed } }}
      />
      <motion.circle
        cx="5.5"
        cy="4.8"
        r="1.6"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.4, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.35 / speed, delay: (on ? 0 : 0) / speed, times: [0, 0.2, 0.7, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M11 4.8H20.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.25 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.1 : 0) / speed } }}
      />
      <motion.circle
        cx="5.5"
        cy="12"
        r="1.6"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.4, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.35 / speed, delay: (on ? 0.3 : 0) / speed, times: [0, 0.2, 0.7, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M11 12H16.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.25 / speed, delay: (on ? 0.4 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.4 : 0) / speed } }}
      />
      <motion.circle
        cx="5.5"
        cy="19.2"
        r="1.6"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.4, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.35 / speed, delay: (on ? 0.6 : 0) / speed, times: [0, 0.2, 0.7, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M11 19.2H19"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.25 / speed, delay: (on ? 0.7 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.7 : 0) / speed } }}
      />
      </g>
    </svg>
  );
}
