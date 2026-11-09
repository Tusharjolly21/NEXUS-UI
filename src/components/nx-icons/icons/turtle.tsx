"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TurtleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A turtle from above that plods along: the feet swing in diagonal pairs while the head bobs and the tail wags. */
export function TurtleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TurtleIconProps) {
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
        style={{ originX: "69.18%", originY: "32.52%" }}
        initial={false}
        animate={on ? { rotate: [0, -22, 0, -22, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, delay: (on ? 0 : 0) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.88 8.5A2.9 1.75 -44 0 1 20.06 4.47A2.9 1.75 -44 0 1 15.88 8.5Z" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        style={{ originX: "30.82%", originY: "69.57%" }}
        initial={false}
        animate={on ? { rotate: [0, 22, 0, 22, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, delay: (on ? 0 : 0) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.12 16A2.6 1.6 -224 0 1 4.37 19.61A2.6 1.6 -224 0 1 8.12 16Z" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        style={{ originX: "30.82%", originY: "32.52%" }}
        initial={false}
        animate={on ? { rotate: [0, 22, 0, 22, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, delay: (on ? 0.2 : 0) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.12 8.5A2.9 1.75 -136 0 1 3.94 4.47A2.9 1.75 -136 0 1 8.12 8.5Z" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        style={{ originX: "69.18%", originY: "69.57%" }}
        initial={false}
        animate={on ? { rotate: [0, -22, 0, -22, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, delay: (on ? 0.2 : 0) / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.88 16A2.6 1.6 44 0 1 19.63 19.61A2.6 1.6 44 0 1 15.88 16Z" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, -0.8, 0, -0.8, 0, -0.8, 0, -0.8, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1], ease: "easeInOut" }}
      >
        <path d="M9.6 4.25a2.4 2.4 0 1 1 4.8 0a2.4 2.4 0 1 1 -4.8 0Z" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "77.71%" }}
        initial={false}
        animate={on ? { rotate: [0, 16, -16, 12, -12, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M10.75 18.65L13.25 18.65L12 21.65Z" fill={accent} stroke={accent} strokeWidth={1} />
      </motion.g>
      <path d="M18.4 12.25a6.4 6.4 0 1 1 -12.8 0a6.4 6.4 0 1 1 12.8 0Z" />
      <path d="M13.25 10.08L14.5 12.25L13.25 14.42L10.75 14.42L9.5 12.25L10.75 10.08Z" strokeWidth={strokeWidth * 0.75} />
      <path d="M13.25 10.08L15.2 6.71M14.5 12.25L18.4 12.25M13.25 14.42L15.2 17.79M10.75 14.42L8.8 17.79M9.5 12.25L5.6 12.25M10.75 10.08L8.8 6.71" strokeWidth={strokeWidth * 0.75} />
    </svg>
  );
}
