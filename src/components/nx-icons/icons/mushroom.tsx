"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MushroomIconProps = {
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

/** A mushroom whose cap bobs while the spots pulse one after another. */
export function MushroomIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MushroomIconProps) {
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
      <path d="M9.2 12.54C9.2 15.2 8.6 17.6 8.2 20" />
      <path d="M14.8 12.54C14.8 15.2 15.4 17.6 15.8 20" />
      <path d="M4.6 20L19.4 20" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.1, 0.94, 1.03, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.2 12A8.8 8 0 0 1 20.8 12Q12 13.2 3.2 12Z" />
        <motion.circle
          cx="8"
          cy="8.2"
          r="1.15"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 / speed, delay: (on ? 0.15 : 0) / speed, ease: "easeInOut" }}
        />
        <motion.circle
          cx="13.2"
          cy="7.2"
          r="1.45"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 / speed, delay: (on ? 0.3 : 0) / speed, ease: "easeInOut" }}
        />
        <motion.circle
          cx="16.6"
          cy="9.1"
          r="1"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 / speed, delay: (on ? 0.45 : 0) / speed, ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
