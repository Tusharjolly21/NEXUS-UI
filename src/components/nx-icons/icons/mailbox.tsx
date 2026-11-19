"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MailboxIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The little red flag on the mailbox drops down and springs back up with a wobble: you have mail. */
export function MailboxIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MailboxIconProps) {
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
      <g transform="translate(1.21 -0.21)">

      <motion.g
        style={{ originX: "64.17%", originY: "45.83%" }}
        initial={false}
        animate={on ? { rotate: [0, -62, -62, 8, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.22, 0.4, 0.62, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M15.4 11V3" stroke={accent} />
        <path d="M15.4 2.6L12.7 2.6A0.5 0.5 0 0 0 12.2 3.1L12.2 4.5A0.5 0.5 0 0 0 12.7 5L15.4 5Z" fill={accent} stroke={accent} strokeWidth={strokeWidth * 0.5} />
      </motion.g>
      <path d="M4.6 14A1 1 0 0 1 3.6 13L3.6 10A3 3 0 0 1 6.6 7L15 7A3 3 0 0 1 18 10L18 13A1 1 0 0 1 17 14Z" />
      <path d="M6.6 7V14" />
      <circle cx="15.4" cy="11" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11.6 14V21.4M9.0 21.4H14.2" />
      </g>
    </svg>
  );
}
