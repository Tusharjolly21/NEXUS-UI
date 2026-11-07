"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PushPinIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A tilted pin that lifts, presses into the surface with a small rebound, and sends an impact ring rippling out around its needle. */
export function PushPinIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PushPinIconProps) {
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
      <ellipse cx="8.61" cy="19.37" rx="5.8" ry="1.6" stroke={accent} />
      <motion.ellipse
        cx="8.61"
        cy="19.37"
        rx="5.8"
        ry="1.6"
        stroke={accent}
        style={{ originX: "35.9%", originY: "80.7%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 1.45], opacity: [0, 0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.5, 1], ease: "easeOut" }}
      />
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, 1.5, -0.75, 0.25, 0], y: [0, -2.1, 1.06, -0.35, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.28, 0.5, 0.68, 1], ease: ["easeOut", "easeIn", "easeOut", "easeInOut"] }}
        >
          <path d="M10.95 9.4L14.28 4.65A3.8 3.8 0 0 1 20.5 9.01L17.17 13.76" fill={accent} fillOpacity={0.2} />
          <path d="M15.67 5.63A2.1 2.1 0 0 1 17.39 4.73" stroke={accent} strokeWidth={1.5} />
          <path d="M8.65 7.8L19.47 15.37" />
          <path d="M14.06 11.58L8.61 19.37" />
        </motion.g>
      </svg>
    </svg>
  );
}
