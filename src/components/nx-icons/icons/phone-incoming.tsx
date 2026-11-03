"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PhoneIncomingIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An arrow glides in from the top right towards the handset, which gives a small nudge as it arrives. */
export function PhoneIncomingIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PhoneIncomingIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
      <motion.g
        style={{ originX: "47%", originY: "56%" }}
        initial={false}
        animate={on ? { scale: [1, 1.07, 0.98, 1], rotate: [0, -4, 3, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.45 / speed, delay: (on ? 0.42 : 0) / speed, ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.84 19.91C11.31 24.43 0.57 13.69 5.09 9.16L8.2 6.05L10.32 8.17L7.21 11.28C6.08 12.41 12.59 18.92 13.72 17.79L16.83 14.68L18.95 16.8L15.84 19.91Z" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [6, -0.8, 0], y: [-6, 0.8, 0], opacity: [0, 1, 1] } : { x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.55 / speed, times: [0, 0.65, 1], ease: "easeOut" }}
      >
        <path d="M20.4 3.6 14 10M14 5.4V10h4.6" stroke={accent} />
      </motion.g>
      </svg>
    </svg>
  );
}
