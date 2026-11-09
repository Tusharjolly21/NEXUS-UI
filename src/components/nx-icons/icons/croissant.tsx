"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CroissantIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A croissant that puffs up while its segments spread apart and a flake falls away. */
export function CroissantIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CroissantIconProps) {
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
        style={{ originX: "50%", originY: "62%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1.04, 1], scaleY: [1, 1.1, 1] } : { scaleX: 1, scaleY: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.45, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M4.32 11.35L6.12 14.93"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M4.32 11.35L6.12 14.93", "M4.32 11.35L5.34 15.36", "M4.32 11.35L6.12 14.93"] } : { d: "M4.32 11.35L6.12 14.93" }}
          transition={{ duration: 0.8 / speed, times: [0, 0.45, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M9.01 7.64L9.97 13.69"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M9.01 7.64L9.97 13.69", "M9.01 7.64L9.08 13.86", "M9.01 7.64L9.97 13.69"] } : { d: "M9.01 7.64L9.97 13.69" }}
          transition={{ duration: 0.8 / speed, times: [0, 0.45, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M14.99 7.64L14.03 13.69"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M14.99 7.64L14.03 13.69", "M14.99 7.64L14.92 13.86", "M14.99 7.64L14.03 13.69"] } : { d: "M14.99 7.64L14.03 13.69" }}
          transition={{ duration: 0.8 / speed, times: [0, 0.45, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M19.68 11.35L17.88 14.93"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M19.68 11.35L17.88 14.93", "M19.68 11.35L18.66 15.36", "M19.68 11.35L17.88 14.93"] } : { d: "M19.68 11.35L17.88 14.93" }}
          transition={{ duration: 0.8 / speed, times: [0, 0.45, 1], ease: "easeInOut" }}
        />
        <path d="M2.95 17.18A5.43 5.43 0 0 1 4.32 11.35A5.43 5.43 0 0 1 9.01 7.64A5.43 5.43 0 0 1 14.99 7.64A5.43 5.43 0 0 1 19.68 11.35A5.43 5.43 0 0 1 21.05 17.18A13.04 13.04 0 0 0 2.95 17.18z" />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.path
          d="M14.6 15.99h.01"
          stroke={accent}
          strokeWidth={2.4}
          initial={false}
          animate={on ? { y: [0, 0, 5.4], x: [0, 0.4, -0.6], opacity: [0, 1, 1, 0] } : { y: 0, x: 0, opacity: 0 }}
          transition={{ duration: 0.7 / speed, delay: (0.3) / speed, times: [0, 0.2, 1], ease: "easeIn" }}
        />
      </svg>
    </svg>
  );
}
