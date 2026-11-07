"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PaintBucketIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A paint bucket that tips to pour, a drop falls into the swatch below and the colour rises to fill it again. */
export function PaintBucketIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PaintBucketIconProps) {
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
      <motion.rect
        x="15.37"
        y="17.53"
        width="4.8"
        height="3.6"
        rx="1.2"
        fill={accent}
        fillOpacity={0.5}
        stroke="none"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0, 0, 1] } : { scaleY: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.58, 0.9], ease: ["easeIn", "linear", "easeOut"] }}
      />
      <rect x="15.37" y="17.53" width="4.8" height="3.6" rx="1.2" stroke={accent} strokeWidth={1.6} />
      <motion.g
        style={{ originX: "43.21%", originY: "50.54%" }}
        initial={false}
        animate={on ? { rotate: [0, 16, 16, 0] } : { rotate: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.3, 0.55, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="rotate(30 10.37 12.13)">
          <path d="M4.27 8.13C4.27 1.13 16.47 1.13 16.47 8.13" />
          <path d="M4.27 8.13H16.47" />
          <path d="M5.37 8.13L6.87 18.13Q6.97 19.53 8.37 19.53H12.37 Q13.77 19.53 13.87 18.13L15.37 8.13" fill={accent} fillOpacity={0.3} />
        </g>
      </motion.g>
      <motion.path
        d="M17.75 12.22C18.45 13.22 19.15 13.92 19.15 14.62a1.4 1.4 0 0 1 -2.8 0C16.35 13.92 17.05 13.22 17.75 12.22z"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { y: [0, 0, 4.81, 0, 0, 0], scale: [1, 1, 0.7, 0, 0, 1], opacity: [1, 1, 0, 0, 0, 1] } : { y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.56, 0.57, 0.75, 1], ease: ["linear", "easeIn", "linear", "linear", "easeOut"] }}
      />
    </svg>
  );
}
