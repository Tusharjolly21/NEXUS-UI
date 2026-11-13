"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ToothbrushIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #2dd4bf. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The brush scrubs back and forth along its length while foam bubbles pop up from the bristles. */
export function ToothbrushIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ToothbrushIconProps) {
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
      <g transform="translate(0 0.58)">

      <g transform="translate(12 12) rotate(-45)">
        <motion.g
          initial={false}
          animate={on ? { x: [0, 2.2, -2.2, 2.2, -2.2, 0] } : { x: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <g stroke={accent} strokeWidth={strokeWidth * 0.7}>
          <path d="M3.5 -1.8V-4.8" />
          <path d="M5.5 -1.8V-4.8" />
          <path d="M7.5 -1.8V-4.8" />
          <path d="M9.5 -1.8V-4.8" />
          </g>
          <path d="M10.2 -1.8A0.6 0.6 0 0 1 10.8 -1.2L10.8 1.2A0.6 0.6 0 0 1 10.2 1.8L2.8 1.8A0.6 0.6 0 0 1 2.2 1.2L2.2 -1.2A0.6 0.6 0 0 1 2.8 -1.8ZM-1.6 -1.9A1 1 0 0 1 -0.6 -0.9L-0.6 0.9A1 1 0 0 1 -1.6 1.9L-9.5 1.9A1.9 1.9 0 0 1 -11.4 0L-11.4 0A1.9 1.9 0 0 1 -9.5 -1.9ZM-0.6 0H2.2" />
        </motion.g>
        {([[4.6, -6.6, 0.2], [8.2, -7.2, 0.35], [2.4, -7.6, 0.5]] as [number, number, number][]).map(([bx, by, dl]) => (
          <motion.circle
            key={bx}
            cx={bx}
            cy={by}
            r="1"
            fill={accent}
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [0, 1.2, 1, 0], opacity: [0, 1, 1, 0], y: [1.5, 0, -0.6, -1.2] } : { scale: 0, opacity: 0, y: 0 }}
            transition={{ duration: 0.5 / speed, delay: (dl) / speed, times: [0, 0.3, 0.7, 1], ease: "easeOut" }}
          />
        ))}
      </g>

      </g>
    </svg>
  );
}
