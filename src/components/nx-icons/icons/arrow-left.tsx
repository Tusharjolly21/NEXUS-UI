"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowLeftIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An arrow that stretches back like elastic, then snaps home against a stop line. */
export function ArrowLeftIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowLeftIconProps) {
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
        d="M21.5 7v10"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.5, 1] }}
      />
      <motion.path
        d="M18.5 12H6"
        style={{ originX: "100%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1.24, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.5, 1], ease: ["easeOut", "easeIn"] }}
      />
      <motion.path
        d="M11.5 6.5 6 12l5.5 5.5"
        initial={false}
        animate={on ? { x: [0, -3, 0] } : { x: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.5, 1], ease: ["easeOut", "easeIn"] }}
      />
    </svg>
  );
}
