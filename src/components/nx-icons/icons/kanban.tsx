"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type KanbanIconProps = {
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

/** Three columns of cards where one card lifts, slides across into the next column, and slides back. */
export function KanbanIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: KanbanIconProps) {
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
      <rect x="2.5" y="2.5" width="4" height="7.5" rx="1.2" />
      <rect x="10" y="2.5" width="4" height="6" rx="1.2" />
      <rect x="17.5" y="2.5" width="4" height="9.5" rx="1.2" />
      <rect x="17.5" y="15.5" width="4" height="6" rx="1.2" />
      <motion.rect
        x="2.5"
        y="13.5"
        width="4"
        height="8"
        rx="1.2"
        stroke={accent}
        style={{ originX: "20.83%", originY: "72.9%" }}
        initial={false}
        animate={on ? { x: [0, 3.75, 7.5, 7.5, 3.75, 0], y: [0, -2, 0, 0, -2, 0], rotate: [0, -5, 0, 0, 5, 0] } : { x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 1.3 / speed, times: [0, 0.2, 0.4, 0.6, 0.82, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
