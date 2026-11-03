"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ZoomInIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30b0c7. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A magnifying glass whose lens swells with a ring of focus rippling out, its plus spinning a quarter turn as the handle gives way. */
export function ZoomInIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ZoomInIconProps) {
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
      <motion.circle
        cx="10.2"
        cy="10.2"
        r="6.6"
        stroke={accent}
        strokeWidth={1.2}
        initial={false}
        animate={on ? { r: [6.6, 10.4], opacity: [0.8, 0] } : { r: 6.6, opacity: 0 }}
        transition={on ? { duration: 0.6 / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
      />
      <motion.circle
        cx="10.2"
        cy="10.2"
        r="6.6"
        initial={false}
        animate={on ? { r: [6.6, 7.8, 6.6] } : { r: 6.6 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M15.2 15.2 20.6 20.6"
        initial={false}
        animate={on ? { x: [0, 0.6, 0], y: [0, 0.6, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M10.2 7.4v5.6M7.4 10.2h5.6"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 90], scale: [1, 1.3, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
