"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SpeedometerIconProps = {
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

/** The needle swings up into the red zone, lighting the ticks as it passes, then settles back. */
export function SpeedometerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SpeedometerIconProps) {
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
      <path d="M2.5 16.35a9.5 9.5 0 0 1 19 0z" />
      <path d="M21.5 16.35A9.5 9.5 0 0 0 19.88 11.04" stroke={accent} />
      <path d="M6.63 13.25 5.76 12.75M8.9 10.98 8.4 10.11M12 10.15V9.15M15.1 10.98 15.6 10.11M17.37 13.25 18.24 12.75" strokeWidth={1.4} />
      {([[8.4, 10.11, 8.9, 10.98, 0.14], [12, 9.15, 12, 10.15, 0.24], [15.6, 10.11, 15.1, 10.98, 0.33], [18.24, 12.75, 17.37, 13.25, 0.42]] as [number, number, number, number, number][]).map(([x1, y1, x2, y2, td]) => (
        <motion.path
          key={x1}
          d={`M${x1} ${y1}L${x2} ${y2}`}
          stroke={accent}
          strokeWidth={1.4}
          initial={false}
          animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.7 / speed, delay: (td - 0.04) / speed, times: [0, 0.15, 0.6, 1] }}
        />
      ))}
      <motion.g
        style={{ originX: "50%", originY: "68.13%" }}
        initial={false}
        animate={on ? { rotate: [0, 115, 106, 112, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.38, 0.5, 0.62, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 16.35 8.89 13.24" />
        <circle cx="12" cy="16.35" r="1.8" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
