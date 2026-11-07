"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DogIconProps = {
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

/** A dog whose head tilts, ears flop and tongue pants out and in. */
export function DogIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DogIconProps) {
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
        style={{ originX: "50%", originY: "46%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 9, -5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.55, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M13.6 16.49A6.2 6.6 0 1 0 10.4 16.49" />
        <motion.path
          d="M8.71 4.51C5.6 3.51 2.4 6.11 2.8 11.31C3 13.51 3.4 15.31 5.3 15.71C5.6 16.01 6 13.11 5.94 11.48"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M8.71 4.51C5.6 3.51 2.4 6.11 2.8 11.31C3 13.51 3.4 15.31 5.3 15.71C5.6 16.01 6 13.11 5.94 11.48", "M8.71 4.51C5 3.51 1.2 5.63 1.6 10.35C1.8 12.23 2.2 13.71 4.1 14.11C4.4 14.41 5.52 13.11 5.94 11.48", "M8.71 4.51C5.6 3.51 2.4 6.11 2.8 11.31C3 13.51 3.4 15.31 5.3 15.71C5.6 16.01 6 13.11 5.94 11.48", "M8.71 4.51C5.6 3.51 2.4 6.11 2.8 11.31C3 13.51 3.4 15.31 5.3 15.71C5.6 16.01 6 13.11 5.94 11.48"] } : { d: "M8.71 4.51C5.6 3.51 2.4 6.11 2.8 11.31C3 13.51 3.4 15.31 5.3 15.71C5.6 16.01 6 13.11 5.94 11.48" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M15.29 4.51C18.4 3.51 21.6 6.11 21.2 11.31C21 13.51 20.6 15.31 18.7 15.71C18.4 16.01 18 13.11 18.06 11.48"
          stroke={accent}
          initial={false}
          animate={on ? { d: ["M15.29 4.51C18.4 3.51 21.6 6.11 21.2 11.31C21 13.51 20.6 15.31 18.7 15.71C18.4 16.01 18 13.11 18.06 11.48", "M15.29 4.51C18.4 3.51 21.6 6.11 21.2 11.31C21 13.51 20.6 15.31 18.7 15.71C18.4 16.01 18 13.11 18.06 11.48", "M15.29 4.51C19 3.51 22.8 5.63 22.4 10.35C22.2 12.23 21.8 13.71 19.9 14.11C19.6 14.41 18.48 13.11 18.06 11.48", "M15.29 4.51C18.4 3.51 21.6 6.11 21.2 11.31C21 13.51 20.6 15.31 18.7 15.71C18.4 16.01 18 13.11 18.06 11.48"] } : { d: "M15.29 4.51C18.4 3.51 21.6 6.11 21.2 11.31C21 13.51 20.6 15.31 18.7 15.71C18.4 16.01 18 13.11 18.06 11.48" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M10.4 16.49L10.4 18.89A1.6 1.6 0 0 0 13.6 18.89L13.6 16.49"
          stroke="#ff375f"
          fill="#ff375f"
          fillOpacity={0.22}
          initial={false}
          animate={on ? { d: ["M10.4 16.49L10.4 18.89A1.6 1.6 0 0 0 13.6 18.89L13.6 16.49", "M10.4 16.49L10.4 20.39A1.6 1.6 0 0 0 13.6 20.39L13.6 16.49", "M10.4 16.49L10.4 17.69A1.6 1.6 0 0 0 13.6 17.69L13.6 16.49", "M10.4 16.49L10.4 20.39A1.6 1.6 0 0 0 13.6 20.39L13.6 16.49", "M10.4 16.49L10.4 18.89A1.6 1.6 0 0 0 13.6 18.89L13.6 16.49"] } : { d: "M10.4 16.49L10.4 18.89A1.6 1.6 0 0 0 13.6 18.89L13.6 16.49" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
        />
        <ellipse cx="9.1" cy="8.91" rx="1" ry="1.3" fill="currentColor" stroke="none" />
        <ellipse cx="14.9" cy="8.91" rx="1" ry="1.3" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="11.91" rx="1.8" ry="1.3" fill={accent} stroke={accent} strokeWidth={1} />
        <path d="M12 13.21L12 14.61" strokeWidth={1.4} />
      </motion.g>
    </svg>
  );
}
