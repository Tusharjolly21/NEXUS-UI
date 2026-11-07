"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type EraserIconProps = {
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

/** An eraser that rubs back and forth along the surface while little shavings spring away from its worn end. */
export function EraserIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: EraserIconProps) {
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
      <path d="M4.2 19.42H19.8" stroke={accent} />
      <motion.circle
        cx="7.34"
        cy="16.59"
        r="1"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { x: [0, -2.55], y: [0, -3.9], opacity: [0, 1, 0], scale: [0.4, 1, 0.5] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (0.25) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="8.14"
        cy="15.99"
        r="1"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { x: [0, -1.65], y: [0, -5.55], opacity: [0, 1, 0], scale: [0.4, 1, 0.5] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (0.49) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="10.94"
        cy="16.99"
        r="1"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { x: [0, 3.45], y: [0, -2.55], opacity: [0, 1, 0], scale: [0.4, 1, 0.5] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (0.37) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="12.34"
        cy="17.39"
        r="1"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { x: [0, 5.1], y: [0, -1.05], opacity: [0, 1, 0], scale: [0.4, 1, 0.5] } : { opacity: 0 }}
        transition={{ duration: 0.45 / speed, delay: (0.61) / speed, ease: "easeOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -3, 3, -2.6, 1.8, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.42, 0.65, 0.85, 1], ease: "easeInOut" }}
      >
        <g transform="rotate(-35 12 11.22)">
          <path d="M10.2 7.22H6.9 A2.4 2.4 0 0 0 4.5 9.62V12.82A2.4 2.4 0 0 0 6.9 15.22H10.2z" fill={accent} fillOpacity={0.3} stroke="none" />
          <rect x="4.5" y="7.22" width="15" height="8" rx="2.4" />
          <path d="M10.2 7.22V15.22" stroke={accent} />
        </g>
      </motion.g>
    </svg>
  );
}
