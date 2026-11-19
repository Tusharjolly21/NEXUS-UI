"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SnorkelMaskIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The mask bobs under the surface and bubbles rise out of the top of the snorkel. */
export function SnorkelMaskIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SnorkelMaskIconProps) {
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
      <g transform="translate(0.79 0.29)">

      <motion.g
        initial={false}
        animate={on ? { y: [0, 1.4, 0, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
      >
        <path d="M4.4 11.2A2.6 2.6 0 0 1 7 8.6L13.8 8.6A2.6 2.6 0 0 1 16.4 11.2L16.4 13.6A2.6 2.6 0 0 1 13.8 16.2L13.18 16.2A0.8 0.8 0 0 1 12.56 15.9L11.34 14.37A1.2 1.2 0 0 0 9.46 14.37L8.24 15.9A0.8 0.8 0 0 1 7.62 16.2L7 16.2A2.6 2.6 0 0 1 4.4 13.6Z" fill={accent} />
        <path d="M4.4 11.4H2.6M16.4 11.4H19.8" />
        <path d="M19.8 3.6V17.4A2.4 2.4 0 0 1 17.4 19.8H14.6" />
      </motion.g>
      <motion.circle
        cx="18.4"
        cy="2.4"
        r="0.9"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { y: [2.4, 2.4, 0, -1], opacity: [0, 0, 1, 0] } : { y: 0, opacity: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.6, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="21"
        cy="1.6"
        r="0.8"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { y: [2.6, 2.6, 0, -0.8], x: [-1.2, -1.2, 0, 0.2], opacity: [0, 0, 1, 0] } : { y: 0, x: 0, opacity: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.45, 0.72, 1], ease: "easeOut" }}
      />

      </g>
    </svg>
  );
}
