"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DeskFanIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #14b8a6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The three blades spin up fast with blur arcs flashing around the hub, then wind down to a stop. */
export function DeskFanIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DeskFanIconProps) {
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
      <circle cx="12" cy="9.7" r="7.2" />
      <path d="M12 16.9V21.5M7.5 21.5H16.5" />
      <motion.g
        style={{ originX: "50%", originY: "40.42%" }}
        initial={false}
        animate={on ? { rotate: [0, 420, 1080] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.4, 1], ease: ["easeIn", "easeOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <ellipse cx="0" cy="0" rx="1.8" ry="2.3" transform="translate(12 9.7) rotate(0) translate(0 -3.3) rotate(25)" fill="currentColor" stroke="none" />
        <ellipse cx="0" cy="0" rx="1.8" ry="2.3" transform="translate(12 9.7) rotate(120) translate(0 -3.3) rotate(25)" fill="currentColor" stroke="none" />
        <ellipse cx="0" cy="0" rx="1.8" ry="2.3" transform="translate(12 9.7) rotate(240) translate(0 -3.3) rotate(25)" fill="currentColor" stroke="none" />
      </motion.g>
      <motion.g
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        style={{ originX: "50%", originY: "40.42%" }}
        initial={false}
        animate={on ? { rotate: [0, 420, 1080], opacity: [0, 0, 1, 1, 0] } : { rotate: 0, opacity: 0 }}
        transition={{
          rotate: { duration: 1.1 / speed, times: [0, 0.4, 1], ease: ["easeIn", "easeOut"] },
          opacity: { duration: 1.1 / speed, times: [0, 0.2, 0.4, 0.62, 0.9] },
        }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M16.13 11.2A4.4 4.4 0 0 1 12.61 14.06" />
        <path d="M8.63 12.53A4.4 4.4 0 0 1 7.92 8.05" />
        <path d="M11.24 5.37A4.4 4.4 0 0 1 15.47 6.99" />
      </motion.g>
      <circle cx="12" cy="9.7" r="1.6" fill={accent} stroke="none" />
    </svg>
  );
}
