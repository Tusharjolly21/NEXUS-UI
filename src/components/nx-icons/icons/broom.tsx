"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BroomIconProps = {
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

/** A broom sweeps from side to side across the floor and flicks a few specks of dust away. */
export function BroomIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BroomIconProps) {
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
        style={{ originX: "82.5%", originY: "11.25%" }}
        initial={false}
        animate={on ? { rotate: [0, 9, -11, 5, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.22, 0.52, 0.78, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M19.81 2.7 13.64 11.19" />
        <path d="M12.18 10.13 15.09 12.25 13.92 13.87 11.01 11.75z" />
        <path d="M10.04 11.05 14.89 14.57 13.09 21.3 4.19 14.83z" />
        <path d="M9.92 14.06 7.16 16.99M12.06 15.61 10.12 19.15" stroke={accent} />
      </motion.g>
      {([[17.2, 19.4, 3.4, -1.6], [18.4, 15.8, 2.4, -2.6], [16.2, 21, 4, 0.2]] as number[][]).map(([x, y, dx, dy], i) => (
        <motion.path
          key={i}
          d={`M${x} ${y}h.01`}
          stroke={accent}
          strokeWidth={2.2}
          initial={false}
          animate={on ? { x: [0, 0, dx], y: [0, 0, dy], opacity: [0, 1, 0], scale: [0.6, 1, 0.8] } : { opacity: 0 }}
          transition={{ duration: 0.7 / speed, times: [0, 0.35, 1], delay: (on ? 0.22 + i * 0.07 : 0) / speed, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
