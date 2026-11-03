"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MousePointerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #32ade6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An arrow cursor that glides in, presses down on the click point and releases, with two ripples spreading out from the tip. */
export function MousePointerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MousePointerIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
      <motion.circle
        cx="6"
        cy="4"
        r="1"
        stroke={accent}
        initial={false}
        animate={on ? { r: [1, 5], opacity: [0, 0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (0.44) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="6"
        cy="4"
        r="1"
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { r: [1, 3], opacity: [0, 0.8, 0] } : { opacity: 0 }}
        transition={{ duration: 0.4 / speed, delay: (0.54) / speed, ease: "easeOut" }}
      />
      <motion.g
        style={{ originX: "25%", originY: "20%" }}
        initial={false}
        animate={on ? { x: [5, 0, 0, 0], y: [5, 0, 0, 0], scale: [1, 1, 0.86, 1] } : { x: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.42, 0.55, 0.78], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M6 4v14.8l3.6-3.4 2.6 5.4 3-1.3-2.5-5.5H18z"
          fill={accent}
          initial={false}
          animate={on ? { fillOpacity: [0, 0, 0.35, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.42, 0.55, 0.78] }}
        />
      </motion.g>
      </svg>
    </svg>
  );
}
