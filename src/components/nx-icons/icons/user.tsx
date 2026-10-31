"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UserIconProps = {
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

/** A person who hops to say hello, with a green dot that pops to show they are online. */
export function UserIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UserIconProps) {
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
      <motion.g
        initial={false}
        animate={on ? { y: [0, -2.2, 0] } : { y: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeOut" }}
      >
        <circle cx="11.2" cy="8.3" r="3.6" />
        <path d="M4.2 20.5c.5-3.8 3.4-6 7-6s6.5 2.2 7 6" />
      </motion.g>
      <motion.circle
        cx="18.8"
        cy="16.6"
        r="2.4"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1.9], opacity: [0.8, 0] } : { scale: 1, opacity: 0 }}
        transition={on ? { duration: 0.5 / speed, delay: (0.3) / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
      />
      <motion.circle
        cx="18.8"
        cy="16.6"
        r="2.4"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { scale: [0, 1.4, 1] } : { scale: 0 }}
        transition={on ? { duration: 0.5 / speed, delay: (0.15) / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
      />
    </svg>
  );
}
