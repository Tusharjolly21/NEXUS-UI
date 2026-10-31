"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MailIconProps = {
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

/** An envelope whose flap opens to show the letter inside. */
export function MailIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MailIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
      <path d="M4 6.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z" />
      <motion.path
        d="M8.2 11.2h7.6M8.2 14.2h4.4"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: 1, y: -3.6 } : { opacity: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300 * speed * speed, damping: 22 * speed, delay: (on ? 0.08 : 0) / speed }}
      />
      <motion.path
        d="M3.5 7.4L12 13.4L20.5 7.4"
        initial={false}
        animate={{ d: on ? "M3.5 7.4L12 2.6L20.5 7.4" : "M3.5 7.4L12 13.4L20.5 7.4" }}
        transition={{ type: "spring", stiffness: 320 * speed * speed, damping: 22 * speed }}
      />
    </svg>
  );
}
