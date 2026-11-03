"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PenToolIconProps = {
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

/** A pen nib sways above a curve that draws itself left to right, anchor points popping onto the path and handles flashing at the middle one. */
export function PenToolIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PenToolIconProps) {
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
        d="M3.5 20.5C7 20.5 8.5 17.6 12 17.6S17 20.5 20.5 20.5"
        initial={false}
        animate={on ? { pathLength: [0.02, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: 0.6 / speed, delay: (0.1) / speed, ease: "easeInOut" }, opacity: { duration: 0.01 / speed, delay: (0.1) / speed } }}
      />
      <motion.path
        d="M8.4 17.6h7.2"
        stroke={accent}
        strokeWidth={1.2}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (0.42) / speed, times: [0, 0.3, 0.7, 1] }}
      />
      {[
        { x: 3.5, y: 20.5, d: 0.1 },
        { x: 12, y: 17.6, d: 0.38 },
        { x: 20.5, y: 20.5, d: 0.66 },
      ].map((p) => (
        <motion.circle
          key={p.x}
          cx={p.x}
          cy={p.y}
          r="1.5"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [0, 1.7, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (p.d) / speed, ease: "easeOut" }}
        />
      ))}
      <motion.g
        style={{ originX: "50%", originY: "62.5%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 0, 9, 0], y: [0, 0, 1.2, 0, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.5, 0.78, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 15C9.8 12.9 6.4 11.4 6.4 8.4L8.2 3h7.6l1.8 5.4c0 3-3.4 4.5-5.6 6.6z" />
        <path d="M12 10v3" />
        <circle cx="12" cy="8.2" r="1.2" fill={accent} stroke="none" />
      </motion.g>
    </svg>
  );
}
