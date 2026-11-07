"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BeerSteinIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A frothy beer mug that tips a little while the foam swells and bubbles float up inside. */
export function BeerSteinIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BeerSteinIconProps) {
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
        style={{ originX: "50%", originY: "85%" }}
        initial={false}
        animate={on ? { rotate: [0, -6, 4, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M4 9h11.5v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <path d="M15.5 11.3h2a2.5 2.5 0 0 1 2.5 2.5v1.4a2.5 2.5 0 0 1-2.5 2.5h-2" />
        <motion.path
          d="M4 9V5.4a2 2 0 0 1 3.833 0 2 2 0 0 1 3.833 0 2 2 0 0 1 3.834 0V9"
          style={{ originX: "50%", originY: "37.5%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1.24, 0.97, 1.1, 1], scaleX: [1, 1.03, 1, 1.02, 1] } : { scaleY: 1, scaleX: 1 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        />
        <path d="M7.4 12.4v4.4" stroke={accent} />
        {([[10.2, 17, 0], [12.9, 15.2, 0.12], [9.6, 14.4, 0.24]] as [number, number, number][]).map(([x, y, d]) => (
          <motion.circle
            key={x}
            cx={x}
            cy={y}
            r="0.9"
            fill={accent}
            stroke="none"
            initial={false}
            animate={on ? { y: [2, -3], opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 1.2] } : { opacity: 0 }}
            transition={{ duration: 0.6 / speed, delay: (0.1 + d) / speed, ease: "easeOut" }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
