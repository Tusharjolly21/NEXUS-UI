"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AlignCenterIconProps = {
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

/** Long lines that open outward from the middle while the short lines slide in from either side to settle on the centre. */
export function AlignCenterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AlignCenterIconProps) {
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
      <motion.line
        x1="4"
        x2="20"
        y1="5.25"
        y2="5.25"
        initial={false}
        animate={on ? { x1: [8, 4], x2: [16, 20] } : { x1: 4, x2: 20 }}
        transition={{ duration: 0.45 / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M7 9.75h10"
        stroke={accent}
        initial={false}
        animate={on ? { x: [-3, 0.5, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeOut" }}
      />
      <motion.line
        x1="4"
        x2="20"
        y1="14.25"
        y2="14.25"
        initial={false}
        animate={on ? { x1: [8, 4], x2: [16, 20] } : { x1: 4, x2: 20 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.2 : 0) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M7 18.75h10"
        stroke={accent}
        initial={false}
        animate={on ? { x: [3, -0.5, 0] } : { x: 0 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.3 : 0) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
