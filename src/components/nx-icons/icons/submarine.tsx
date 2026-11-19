"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SubmarineIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffcc00. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The periscope dips, pops back up and turns to look both ways while the propeller spins at the stern. */
export function SubmarineIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SubmarineIconProps) {
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
      <g transform="translate(0.08 1.12)">

      <svg x="0" y="0" width="24" height="8.2" viewBox="0 0 24 8.2" overflow="hidden">
        <motion.g
          style={{ originX: "52.5%", originY: "18.33%" }}
          initial={false}
          animate={on ? { y: [0, 2.6, 0, 0, 0, 0, 0], scaleX: [1, 1, 1, -1, -1, 1, 1] } : { y: 0, scaleX: 1 }}
          transition={{ duration: 1.2 / speed, times: [0, 0.18, 0.38, 0.52, 0.68, 0.84, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12.6 9.7V4.4H14.5" stroke={accent} />
        </motion.g>
      </svg>
      <path d="M5.2 14.4A3 3 0 0 1 8.2 11.4L17.6 11.4A3 3 0 0 1 20.6 14.4L20.6 14.4A3 3 0 0 1 17.6 17.4L8.2 17.4A3 3 0 0 1 5.2 14.4Z" />
      <path d="M9.4 11.4L9.88 8.85A0.8 0.8 0 0 1 10.66 8.2L13.6 8.2A0.8 0.8 0 0 1 14.4 9L14.4 11.4" />
      <g fill="currentColor" stroke="none"><circle cx="10.6" cy="14.4" r="0.95" /><circle cx="13.6" cy="14.4" r="0.95" /><circle cx="16.6" cy="14.4" r="0.95" /></g>
      <path d="M5.2 14.4H3.2" />
      <motion.path
        d="M3.2 12.5V16.3"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0.15, 1, 0.15, 1, 0.15, 1] } : { scaleY: 1 }}
        transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
      />
      </g>
    </svg>
  );
}
