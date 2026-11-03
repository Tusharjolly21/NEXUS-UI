"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ColumnsIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #00c7be. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A box divided into three columns whose two dividers slide apart so the middle column swells, then snap shut again. */
export function ColumnsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ColumnsIconProps) {
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
      <motion.rect
        x="9"
        y="5"
        width="6"
        height="14"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1.8, 1.8, 0.9, 1], fillOpacity: [0, 0.26, 0.26, 0.1, 0] } : { scaleX: 1, fillOpacity: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.32, 0.55, 0.8, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M9 4V20"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, -2.4, -2.4, 0.5, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.32, 0.55, 0.8, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M15 4V20"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, 2.4, 2.4, -0.5, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.32, 0.55, 0.8, 1], ease: "easeInOut" }}
      />
      <rect x="3" y="4" width="18" height="16" rx="2.6" />
    </svg>
  );
}
