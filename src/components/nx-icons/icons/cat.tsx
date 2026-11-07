"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CatIconProps = {
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

/** A cat whose ears twitch in turn, eyes blink and whiskers wiggle. */
export function CatIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CatIconProps) {
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
      <path d="M9.62 6.75A7.7 7.2 0 0 1 14.38 6.75M19.09 10.79A7.7 7.2 0 1 1 4.91 10.79" />
      <motion.path
        d="M4.91 10.79L5.2 3.1L9.62 6.75"
        initial={false}
        animate={on ? { d: ["M4.91 10.79L5.2 3.1L9.62 6.75", "M4.91 10.79L4.2 4L9.62 6.75", "M4.91 10.79L5.2 3.1L9.62 6.75", "M4.91 10.79L5.7 4.4L9.62 6.75", "M4.91 10.79L5.2 3.1L9.62 6.75", "M4.91 10.79L5.2 3.1L9.62 6.75"] } : { d: "M4.91 10.79L5.2 3.1L9.62 6.75" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.12, 0.24, 0.36, 0.48, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M19.09 10.79L18.8 3.1L14.38 6.75"
        initial={false}
        animate={on ? { d: ["M19.09 10.79L18.8 3.1L14.38 6.75", "M19.09 10.79L18.8 3.1L14.38 6.75", "M19.09 10.79L19.8 4L14.38 6.75", "M19.09 10.79L18.8 3.1L14.38 6.75", "M19.09 10.79L18.3 4.4L14.38 6.75", "M19.09 10.79L18.8 3.1L14.38 6.75", "M19.09 10.79L18.8 3.1L14.38 6.75"] } : { d: "M19.09 10.79L18.8 3.1L14.38 6.75" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.42, 0.54, 0.66, 0.78, 1], ease: "easeInOut" }}
      />
      {[8.9, 15.1].map((x) => (
        <motion.ellipse
          key={x}
          cx={x}
          cy="12.7"
          rx="1.05"
          ry="1.4"
          fill="currentColor"
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1, 0.12, 1, 1] } : { scaleY: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.5, 0.58, 0.68, 1] }}
        />
      ))}
      <path d="M10.5 15.1L13.5 15.1L12 16.8Z" fill={accent} stroke={accent} strokeWidth={1.2} />
      <path d="M12 16.8L12 17.5M9.9 18.2Q11.5 19.1 12 17.5Q12.5 19.1 14.1 18.2" strokeWidth={1.4} />
      <motion.path
        d="M4.34 14.3L2.7 12.8M5.05 16.7L2.7 18.2"
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { d: ["M4.34 14.3L2.7 12.8M5.05 16.7L2.7 18.2", "M4.34 14.3L2.7 12.8M5.05 16.7L2.7 18.2", "M4.34 14.3L2.7 13.8M5.05 16.7L2.7 17.2", "M4.34 14.3L2.7 11.9M5.05 16.7L2.7 19.1", "M4.34 14.3L2.7 13.8M5.05 16.7L2.7 17.2", "M4.34 14.3L2.7 12.8M5.05 16.7L2.7 18.2"] } : { d: "M4.34 14.3L2.7 12.8M5.05 16.7L2.7 18.2" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.55, 0.67, 0.79, 0.9, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M19.66 14.3L21.3 12.8M18.95 16.7L21.3 18.2"
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { d: ["M19.66 14.3L21.3 12.8M18.95 16.7L21.3 18.2", "M19.66 14.3L21.3 12.8M18.95 16.7L21.3 18.2", "M19.66 14.3L21.3 13.8M18.95 16.7L21.3 17.2", "M19.66 14.3L21.3 11.9M18.95 16.7L21.3 19.1", "M19.66 14.3L21.3 13.8M18.95 16.7L21.3 17.2", "M19.66 14.3L21.3 12.8M18.95 16.7L21.3 18.2"] } : { d: "M19.66 14.3L21.3 12.8M18.95 16.7L21.3 18.2" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.55, 0.67, 0.79, 0.9, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
