"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChartBubbleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Three bubbles of different sizes pop out of nothing one after another and settle with a small overshoot. */
export function ChartBubbleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChartBubbleIconProps) {
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
      <motion.circle
        cx="8.6"
        cy="14.45"
        r="5.5"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.15, 1.14, 1] } : { scale: 1 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0 : 0) / speed, times: [0, 0.25, 0.7, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="17.7"
        cy="7.25"
        r="3.2"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.15, 1.14, 1] } : { scale: 1 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.13 : 0) / speed, times: [0, 0.25, 0.7, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="18.7"
        cy="17.85"
        r="2" fill={accent} stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.15, 1.14, 1] } : { scale: 1 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.26 : 0) / speed, times: [0, 0.25, 0.7, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
