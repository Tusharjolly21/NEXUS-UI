"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FilterIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A funnel whose wide mouth squeezes in, sifting what falls through. */
export function FilterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FilterIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
      <motion.path
        d="M2 3h20"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.55, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M4 3l6 9.2V19l4 2v-8.8L20 3"
        style={{ originX: "50%", originY: "0%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.82, 1], scaleY: [1, 1.04, 1] } : { scaleX: 1, scaleY: 1 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
