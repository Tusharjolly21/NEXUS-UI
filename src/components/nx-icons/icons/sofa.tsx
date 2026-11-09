"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SofaIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The two back cushions plump up one after the other, the left one first, then settle back into the sofa. */
export function SofaIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SofaIconProps) {
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
      <motion.path
        d="M6 10.8 V6.8 a1.5 1.5 0 0 1 1.5 -1.5 H10.5 a1.5 1.5 0 0 1 1.5 1.5 V10.8"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M6 10.8 V6.8 a1.5 1.5 0 0 1 1.5 -1.5 H10.5 a1.5 1.5 0 0 1 1.5 1.5 V10.8", "M6 10.8 V5.4 a1.5 1.5 0 0 1 1.5 -1.5 H10.5 a1.5 1.5 0 0 1 1.5 1.5 V10.8", "M6 10.8 V6.8 a1.5 1.5 0 0 1 1.5 -1.5 H10.5 a1.5 1.5 0 0 1 1.5 1.5 V10.8"] } : { d: "M6 10.8 V6.8 a1.5 1.5 0 0 1 1.5 -1.5 H10.5 a1.5 1.5 0 0 1 1.5 1.5 V10.8" }}
        transition={{ duration: 0.5 / speed, delay: (0.05) / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M12 10.8 V6.8 a1.5 1.5 0 0 1 1.5 -1.5 H16.5 a1.5 1.5 0 0 1 1.5 1.5 V10.8"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M12 10.8 V6.8 a1.5 1.5 0 0 1 1.5 -1.5 H16.5 a1.5 1.5 0 0 1 1.5 1.5 V10.8", "M12 10.8 V5.4 a1.5 1.5 0 0 1 1.5 -1.5 H16.5 a1.5 1.5 0 0 1 1.5 1.5 V10.8", "M12 10.8 V6.8 a1.5 1.5 0 0 1 1.5 -1.5 H16.5 a1.5 1.5 0 0 1 1.5 1.5 V10.8"] } : { d: "M12 10.8 V6.8 a1.5 1.5 0 0 1 1.5 -1.5 H16.5 a1.5 1.5 0 0 1 1.5 1.5 V10.8" }}
        transition={{ duration: 0.5 / speed, delay: (0.3) / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
      />
      <path d="M2.5 16.8 V10.8 a1.75 1.75 0 0 1 3.5 0 V16.8" />
      <path d="M2.5 16.8 V10.8 a1.75 1.75 0 0 1 3.5 0 V16.8" transform="translate(24 0) scale(-1 1)" />
      <path d="M6 10.8H18" />
      <path d="M2.5 16.8H21.5" />
      <path d="M4.25 16.8V18.8M19.75 16.8V18.8" />
    </svg>
  );
}
