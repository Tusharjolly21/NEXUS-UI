"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SignatureIconProps = {
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

/** A looping signature that draws itself in along the baseline while a pen follows the line and comes to rest at its end. */
export function SignatureIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SignatureIconProps) {
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
      <path d="M2.7 19.75h18" />
      <motion.path
        d="M3.2 16.75C4.3 13.25 5.5 4.25 7.7 4.25C9.9 4.25 8.9 11.75 6.9 14.35C5.3 16.45 4.3 13.95 6.9 13.15C9.7 12.35 10.7 15.75 12.7 15.75C13.9 15.75 14.5 14.95 15.3 13.95"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.9 / speed, ease: "linear" }}
      />
      <motion.path
        d="M15.3 13.95L18.48 12.89L21.31 10.06L19.19 7.94L16.36 10.77z"
        initial={false}
        animate={on ? { x: [-12.1, -11.3, -10.56, -9.69, -8.12, -6.38, -6.61, -7.53, -9.54, -8.23, -5.28, -2.56, 0], y: [2.8, -0.39, -3.57, -6.7, -9.52, -7.56, -4.31, -1.17, 1.22, -0.84, 0.13, 1.8, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "linear" }}
      />
      </svg>
    </svg>
  );
}
