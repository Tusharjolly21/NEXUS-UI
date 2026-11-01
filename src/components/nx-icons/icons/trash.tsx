"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TrashIconProps = {
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

/** A bin whose lid opens, catches a crumpled paper and closes again. */
export function TrashIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TrashIconProps) {
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
        x="10.3"
        y="0.8"
        width="3.4"
        height="3.4"
        rx="0.8"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 0, 10, 11], opacity: [0, 1, 1, 0], rotate: [0, 20, -12, 0] } : { y: 0, opacity: 0, rotate: 0 }}
        transition={{ duration: 1.3 / speed, times: [0, 0.2, 0.62, 0.7], ease: "easeIn" }}
      />
      <motion.g
        style={{ originX: "6%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -12, -12, 0] } : { rotate: 0 }}
        transition={{ duration: 1.3 / speed, times: [0, 0.1, 0.62, 0.78], ease: "easeInOut" }}
      >
        <path d="M4 6.5h16" />
        <path d="M9.5 6.5V4.2a.7.7 0 0 1 .7-.7h3.6a.7.7 0 0 1 .7.7v2.3" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0, 0.8, 0] } : { y: 0 }}
        transition={{ duration: 1.3 / speed, times: [0, 0.62, 0.7, 0.82] }}
      >
        <path d="M6 6.5l.9 12.3a2 2 0 0 0 2 1.8h6.2a2 2 0 0 0 2-1.8L18 6.5" />
        <path d="M10.2 10.5v6M13.8 10.5v6" />
      </motion.g>
    </svg>
  );
}
