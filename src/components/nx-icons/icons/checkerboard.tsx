"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CheckerboardIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #34a853. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The dark squares flip over like tiles in a wave that runs diagonally across the board from corner to corner. */
export function CheckerboardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CheckerboardIconProps) {
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
      <motion.path
        d="M7.8 3.6L12 3.6L12 7.8L7.8 7.8Z"
        fill={accent}
        stroke="none"
        style={{ originX: "41.25%", originY: "23.75%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1, 0, 1.12, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.05, 0.2, 0.36, 0.5], ease: "easeInOut" }}
      />
      <motion.path
        d="M3.6 7.8L7.8 7.8L7.8 12L3.6 12Z"
        fill={accent}
        stroke="none"
        style={{ originX: "23.75%", originY: "41.25%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1, 0, 1.12, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.05, 0.2, 0.36, 0.5], ease: "easeInOut" }}
      />
      <motion.path
        d="M16.2 3.6L18.4 3.6A2 2 0 0 1 20.4 5.6L20.4 7.8L16.2 7.8Z"
        fill={accent}
        stroke="none"
        style={{ originX: "76.25%", originY: "23.75%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1, 0, 1.12, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.35, 0.51, 0.65], ease: "easeInOut" }}
      />
      <motion.path
        d="M12 7.8L16.2 7.8L16.2 12L12 12Z"
        fill={accent}
        stroke="none"
        style={{ originX: "58.75%", originY: "41.25%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1, 0, 1.12, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.35, 0.51, 0.65], ease: "easeInOut" }}
      />
      <motion.path
        d="M7.8 12L12 12L12 16.2L7.8 16.2Z"
        fill={accent}
        stroke="none"
        style={{ originX: "41.25%", originY: "58.75%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1, 0, 1.12, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.35, 0.51, 0.65], ease: "easeInOut" }}
      />
      <motion.path
        d="M3.6 16.2L7.8 16.2L7.8 20.4L5.6 20.4A2 2 0 0 1 3.6 18.4Z"
        fill={accent}
        stroke="none"
        style={{ originX: "23.75%", originY: "76.25%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1, 0, 1.12, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.35, 0.51, 0.65], ease: "easeInOut" }}
      />
      <motion.path
        d="M16.2 12L20.4 12L20.4 16.2L16.2 16.2Z"
        fill={accent}
        stroke="none"
        style={{ originX: "76.25%", originY: "58.75%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1, 0, 1.12, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.35, 0.5, 0.66, 0.8], ease: "easeInOut" }}
      />
      <motion.path
        d="M12 16.2L16.2 16.2L16.2 20.4L12 20.4Z"
        fill={accent}
        stroke="none"
        style={{ originX: "58.75%", originY: "76.25%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1, 0, 1.12, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.35, 0.5, 0.66, 0.8], ease: "easeInOut" }}
      />
      <path d="M3.6 5.6A2 2 0 0 1 5.6 3.6L18.4 3.6A2 2 0 0 1 20.4 5.6L20.4 18.4A2 2 0 0 1 18.4 20.4L5.6 20.4A2 2 0 0 1 3.6 18.4Z" />
    </svg>
  );
}
