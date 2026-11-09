"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type OwlIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An owl that turns its head to each side with its eyes following, then blinks. */
export function OwlIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: OwlIconProps) {
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
      <path d="M6.74 6.2L4.7 2.8L9.41 5.12A9.4 8.2 0 0 1 14.59 5.12L19.3 2.8L17.26 6.2A9.4 8.2 0 1 1 6.74 6.2Z" />
      <path d="M8.8 15.2L12 16.7L15.2 15.2M8.8 17.4L12 18.9L15.2 17.4" strokeWidth={strokeWidth * 0.6} />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -0.3, 0.3, 0, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <motion.g
          style={{ originX: "34.58%", originY: "44.17%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1, 0.08, 1, 1] } : { scaleY: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.72, 0.82, 0.92, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M10.8 10.6a2.5 2.5 0 1 1 -5 0a2.5 2.5 0 1 1 5 0Z" strokeWidth={strokeWidth * 0.75} />
          <motion.circle
            cx="8.3"
            cy="10.6"
            r="1"
            fill="currentColor"
            stroke="none"
            initial={false}
            animate={on ? { x: [0, -0.5, 0.5, 0, 0] } : { x: 0 }}
            transition={{ duration: 1 / speed, times: [0, 0.2, 0.5, 0.75, 1], ease: "easeInOut" }}
          />
        </motion.g>
        <motion.g
          style={{ originX: "65.42%", originY: "44.17%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1, 0.08, 1, 1] } : { scaleY: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.72, 0.82, 0.92, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M18.2 10.6a2.5 2.5 0 1 1 -5 0a2.5 2.5 0 1 1 5 0Z" strokeWidth={strokeWidth * 0.75} />
          <motion.circle
            cx="15.7"
            cy="10.6"
            r="1"
            fill="currentColor"
            stroke="none"
            initial={false}
            animate={on ? { x: [0, -0.5, 0.5, 0, 0] } : { x: 0 }}
            transition={{ duration: 1 / speed, times: [0, 0.2, 0.5, 0.75, 1], ease: "easeInOut" }}
          />
        </motion.g>
        <motion.path
          d="M11.3 13.4L12.7 13.4L12 14.8Z"
          fill={accent}
          stroke={accent}
          strokeWidth={1}
          initial={false}
          animate={on ? { x: [0, -0.4, 0.4, 0, 0] } : { x: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.2, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
