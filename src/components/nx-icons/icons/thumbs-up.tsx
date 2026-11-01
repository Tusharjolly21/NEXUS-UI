"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ThumbsUpIconProps = {
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

/** A thumbs-up that winds back, then snaps forward and throws off a burst of sparks. */
export function ThumbsUpIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ThumbsUpIconProps) {
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
        style={{ originX: "20%", originY: "90%" }}
        initial={false}
        animate={on ? { rotate: [0, 12, -14, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect x="3" y="11" width="3.8" height="9.5" rx="1" />
        <motion.path
          d="M8.8 11.2 12 4.6c.5-1 1.6-1.4 2.5-.9s1.3 1.5 1 2.4L14.7 9.4h4.5a2 2 0 0 1 1.95 2.4l-1.2 6.6a2.4 2.4 0 0 1-2.35 1.9H8.8z"
          fill={accent}
          initial={false}
          animate={on ? { fillOpacity: [0, 0, 0.9] } : { fillOpacity: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.6, 1] }}
        />
      </motion.g>
      <motion.path
        d="M18.4 3.2l-1 1.7M21.2 6l-1.8.8M15.6 1.8l.2 1.8"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 0], scale: [0.5, 0.5, 1.1, 1] } : { opacity: 0, scale: 0.5 }}
        style={{ originX: "30%", originY: "100%" }}
        transition={{ duration: 0.8 / speed, times: [0, 0.6, 0.75, 1] }}
      />
    </svg>
  );
}
