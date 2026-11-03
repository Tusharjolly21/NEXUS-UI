"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PhoneCallIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #00c7be. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A handset that rings in two shaking bursts while sound arcs pop outward from it in turn. */
export function PhoneCallIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PhoneCallIconProps) {
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
        style={{ originX: "47%", originY: "56%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 9, -9, 9, 0, 0, -9, 9, -9, 9, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.07, 0.14, 0.21, 0.28, 0.36, 0.5, 0.57, 0.64, 0.71, 0.78, 0.86], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.84 19.91C11.31 24.43 0.57 13.69 5.09 9.16L8.2 6.05L10.32 8.17L7.21 11.28C6.08 12.41 12.59 18.92 13.72 17.79L16.83 14.68L18.95 16.8L15.84 19.91Z" />
      </motion.g>
      {["M13.4 7.22A4.6 4.6 0 0 1 17.58 11.4", "M13.7 3.92A8 8 0 0 1 20.88 11.1"].map((d, i) => (
        <motion.g
          key={d}
          style={{ originX: "54%", originY: "49%" }}
          initial={false}
          animate={on ? { scale: [1, 0.7, 1.1, 1, 0.7, 1.1, 1], opacity: [1, 0, 1, 1, 0, 1, 1] } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, delay: (i * 0.1) / speed, times: [0, 0.05, 0.3, 0.5, 0.55, 0.8, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d={d} stroke={accent} />
        </motion.g>
      ))}
    </svg>
  );
}
