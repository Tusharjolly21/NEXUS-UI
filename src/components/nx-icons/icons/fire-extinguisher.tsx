"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FireExtinguisherIconProps = {
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

/** The red handle is squeezed down against the grip, the gauge needle flicks over, and a cloud of spray puffs out of the nozzle. */
export function FireExtinguisherIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FireExtinguisherIconProps) {
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
      <path d="M11.25 19 V13 a3 3 0 0 1 3 -3 H17.25 a3 3 0 0 1 3 3 V19 a2 2 0 0 1 -2 2 H13.25 a2 2 0 0 1 -2 -2 Z" />
      <path d="M15.75 10V6.25" />
      <path d="M20.25 3V6.25" />
      <path d="M20.25 6.25 H8.5 a3 3 0 0 0 -3 3 V16.5" />
      <path d="M3.75 16.5H7.25" />
      <circle cx="15.75" cy="15.5" r="2" strokeWidth={strokeWidth * 0.75} />
      <motion.g
        style={{ originX: "65.625%", originY: "64.583%" }}
        initial={false}
        animate={on ? { rotate: [0, 80, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, delay: (0.12) / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.75 15.5L17.164 14.086" strokeWidth={strokeWidth * 0.5} strokeLinecap="butt" />
      </motion.g>
      <motion.g
        style={{ originX: "84.375%", originY: "12.5%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, -8, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.6, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M13 3H20.25" stroke={accent} />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        {([[5.5, 19.5, 0.5], [3.7, 19.0, 0.9], [4.7, 20.9, 0.7]] as [number, number, number][]).map(([cx, cy, d], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r="1.2"
            fill={accent}
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [0, 1.5, 1.1], opacity: [0, 1, 0], x: [2, 0, -1.2], y: [-2.5, 0, 0.8] } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.55 / speed, delay: (0.15 + d * 0.2) / speed, times: [0, 0.35, 1], ease: "easeOut" }}
          />
        ))}
      </svg>
    </svg>
  );
}
