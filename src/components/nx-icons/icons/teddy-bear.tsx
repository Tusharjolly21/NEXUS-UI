"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TeddyBearIconProps = {
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

/** The teddy is squeezed into a hug, its ears twitch and the heart on its tummy pops, then it springs back. */
export function TeddyBearIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TeddyBearIconProps) {
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
        style={{ originX: "50%", originY: "88.33%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1.08, 0.96, 1.02, 1], scaleY: [1, 0.92, 1.04, 0.99, 1] } : { scaleX: 1, scaleY: 1 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.25, 0.5, 0.72, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.g
          style={{ originX: "50%", originY: "33.33%" }}
          initial={false}
          animate={on ? { rotate: [0, -10, 7, -3, 0] } : { rotate: 0 }}
          transition={{ duration: 0.85 / speed, times: [0, 0.25, 0.5, 0.72, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="8.46" cy="4.46" r="1.8" fill="currentColor" stroke="none" />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "33.33%" }}
          initial={false}
          animate={on ? { rotate: [0, 10, -7, 3, 0] } : { rotate: 0 }}
          transition={{ duration: 0.85 / speed, times: [0, 0.25, 0.5, 0.72, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="15.54" cy="4.46" r="1.8" fill="currentColor" stroke="none" />
        </motion.g>
        <circle cx="7.21" cy="14.58" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="16.79" cy="14.58" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="8.85" cy="19.35" r="1.9" fill="currentColor" stroke="none" />
        <circle cx="15.15" cy="19.35" r="1.9" fill="currentColor" stroke="none" />
        <circle cx="12" cy="8" r="4" />
        <path d="M13.25 11.8A4 4 0 1 1 10.75 11.8" />
        <circle cx="10.5" cy="7.6" r="0.75" fill="currentColor" stroke="none" />
        <circle cx="13.5" cy="7.6" r="0.75" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="9.3" rx="1.05" ry="0.75" fill="currentColor" stroke="none" />
        <motion.path
          d="M12 17.55L10.87 16.42A0.8 0.8 0 0 1 12 15.29A0.8 0.8 0 0 1 13.13 16.42Z"
          fill={accent}
          stroke={accent}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.22, 0.95, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.85 / speed, times: [0, 0.25, 0.5, 0.72, 1], ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
