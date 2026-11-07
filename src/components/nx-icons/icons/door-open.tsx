"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DoorOpenIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A door that swings shut about its hinge until only a sliver of light is left, then swings open again. */
export function DoorOpenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DoorOpenIconProps) {
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
      <path d="M4 21V3H20V21M3 21H21" />
      <motion.path
        d="M18.7 5V19"
        stroke={accent}
        strokeWidth={0.7}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.42, 0.6, 0.72] }}
      />
      <motion.path
        d="M4 3L13 5.5V18.5L4 21"
        initial={false}
        animate={on ? { d: ["M4 3L13 5.5V18.5L4 21", "M4 3L17.4 3.7V20.3L4 21", "M4 3L17.4 3.7V20.3L4 21", "M4 3L12.2 5.8V18.2L4 21", "M4 3L13 5.5V18.5L4 21"] } : { d: "M4 3L13 5.5V18.5L4 21" }}
        transition={{ duration: 1 / speed, times: [0, 0.38, 0.6, 0.84, 1], ease: "easeInOut" }}
      />
      <motion.circle
        cy="12"
        r="0.9"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { cx: [11, 15.4, 15.4, 10.2, 11] } : { cx: 11 }}
        transition={{ duration: 1 / speed, times: [0, 0.38, 0.6, 0.84, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
