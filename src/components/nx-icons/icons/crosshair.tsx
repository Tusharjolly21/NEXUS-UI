"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CrosshairIconProps = {
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

/** A sight ring opens, snaps tight onto its target as the ticks close in, and a red centre dot pulses with a ripple. */
export function CrosshairIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CrosshairIconProps) {
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
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.12, 0.84, 0.96, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.45, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="12" r="6.5" />
      </motion.g>
      {([
        ["M12 3V7.8", 0, -1],
        ["M21 12H16.2", 1, 0],
        ["M12 21V16.2", 0, 1],
        ["M3 12H7.8", -1, 0],
      ] as [string, number, number][]).map(([d, dx, dy]) => (
        <motion.path
          key={d}
          d={d}
          initial={false}
          animate={on ? { x: [0, dx * 1, dx * -1.2, dx * -0.3, 0], y: [0, dy * 1, dy * -1.2, dy * -0.3, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.45, 0.7, 1], ease: "easeInOut" }}
        />
      ))}
      <motion.circle
        cx="12"
        cy="12"
        r="1.4"
        stroke={accent}
        strokeWidth={strokeWidth * 0.6}
        initial={false}
        animate={on ? { r: [1.4, 1.4, 4.6], opacity: [0, 0.9, 0] } : { r: 1.4, opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (0.4) / speed, times: [0, 0.01, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="1.4"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 1.9, 1, 1.5, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.42, 0.52, 0.65, 0.78, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
