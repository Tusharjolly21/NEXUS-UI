"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HelicopterIconProps = {
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

/** A helicopter whose rotor blurs into a spin and tail rotor whirls as the whole craft lifts a little and settles. */
export function HelicopterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HelicopterIconProps) {
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
        animate={on ? { y: [0, -1.5, -1.5, 0], rotate: [0, -2.5, -2.5, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <ellipse cx="14" cy="11.8" rx="6.6" ry="5" />
        <rect x="14.3" y="10.1" width="3.4" height="2.2" rx="0.6" fill="currentColor" stroke="none" />
        <path d="M7.4 11.8H5L3.8 8" />
        <path d="M14 6.8V4.4M12.2 16.61V19.6M15.8 16.61V19.6M8.6 19.6H19.4" />
        <motion.ellipse
          cx="14"
          cy="4.4"
          rx="7.5"
          ry="1.1"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { opacity: [0, 0.4, 0.4, 0.4, 0] } : { opacity: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.15, 0.5, 0.8, 1], ease: "linear" }}
        />
        <motion.path
          d="M6.5 4.4H21.5"
          stroke={accent}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scaleX: [1, 0.25, 1, 0.25, 1, 0.25, 1, 0.25, 1] } : { scaleX: 1 }}
          transition={{ duration: 0.9 / speed, ease: "linear" }}
        />
        <motion.path
          d="M2.3 8H5.3M3.8 6.5V9.5"
          strokeWidth={strokeWidth * 0.6}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, 1080] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}
