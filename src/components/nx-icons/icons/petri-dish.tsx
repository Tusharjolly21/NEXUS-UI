"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PetriDishIconProps = {
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

/** A drop falls into the dish and a ripple spreads while the colonies shrink and bloom again one by one. */
export function PetriDishIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PetriDishIconProps) {
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
      <g transform="translate(0 0.4)">

      <motion.path
        d="M10.2 2.2C10.9 3.2 11.4 3.9 11.4 4.5A1.2 1.2 0 0 1 9 4.5C9 3.9 9.5 3.2 10.2 2.2Z"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 0, 4.9, 4.9, 0], opacity: [0, 1, 1, 0, 0] } : { y: 0, opacity: 0 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.08, 0.72, 0.8, 1], ease: "easeIn" }}
      />
      <motion.ellipse
        cx="10.2" cy="9.9" rx="1.2" ry="0.5" stroke={accent} strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { rx: [1.2, 1.2, 4.4, 1.2], ry: [0.5, 0.5, 1.8, 0.5], opacity: [0, 0.9, 0, 0] } : { rx: 1.2, ry: 0.5, opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.36) / speed, times: [0, 0.02, 0.9, 1], ease: "easeOut" }}
      />
      <motion.circle cx="8" cy="10.6" r="1.25" fill={accent} stroke="none" style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { scale: [1, 1, 0.5, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.9 / speed, times: [0, 0.22, 0.42, 0.6, 1], ease: "easeInOut" }} />
      <motion.circle cx="12.3" cy="8.8" r="0.95" fill={accent} stroke="none" style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { scale: [1, 1, 0.5, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.5, 0.68, 1], ease: "easeInOut" }} />
      <motion.circle cx="15.8" cy="10.9" r="1.1" fill={accent} stroke="none" style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { scale: [1, 1, 0.5, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.9 / speed, times: [0, 0.38, 0.58, 0.76, 1], ease: "easeInOut" }} />
      <motion.circle cx="11.7" cy="11.9" r="0.8" fill={accent} stroke="none" style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { scale: [1, 1, 0.5, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.9 / speed, times: [0, 0.46, 0.66, 0.84, 1], ease: "easeInOut" }} />
      <ellipse cx="12" cy="10.2" rx="9" ry="4.2" />
      <path d="M3 10.2V13A9 4.2 0 0 0 21 13V10.2" />
      </g>
    </svg>
  );
}
