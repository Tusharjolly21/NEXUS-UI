"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AvocadoIconProps = {
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

/** A halved avocado whose stone pops up, squashes and settles back into its hollow. */
export function AvocadoIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AvocadoIconProps) {
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
      <path d="M15.49 5.3L18.25 11.72A6.8 6.8 0 1 1 5.75 11.72L8.51 5.3A3.8 3.8 0 0 1 15.49 5.3z" />
      <motion.circle
        cx="12"
        cy="15"
        r="3.1"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { y: [0, -3, 0.6, -0.8, 0], scaleX: [1, 0.94, 1.06, 0.98, 1], scaleY: [1, 1.08, 0.92, 1.02, 1] } : { y: 0, scaleX: 1, scaleY: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.55, 0.78, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
