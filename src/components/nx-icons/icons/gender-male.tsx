"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GenderMaleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #2f8cff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The mars arrow thrusts out of its ring twice, the shaft stretching with it, and springs back into place. */
export function GenderMaleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GenderMaleIconProps) {
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
        d="M14.46 9.54L18.42 5.58"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M14.46 9.54L18.42 5.58", "M14.46 9.54L19.48 4.52", "M14.46 9.54L18.17 5.83", "M14.46 9.54L18.98 5.02", "M14.46 9.54L18.42 5.58"] } : { d: "M14.46 9.54L18.42 5.58" }}
        transition={{ duration: 0.8 / speed, times: [0, 0.25, 0.5, 0.72, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M14.22 5.58L18.42 5.58L18.42 9.78"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M14.22 5.58L18.42 5.58L18.42 9.78", "M15.28 4.52L19.48 4.52L19.48 8.72", "M13.97 5.83L18.17 5.83L18.17 10.03", "M14.78 5.02L18.98 5.02L18.98 9.22", "M14.22 5.58L18.42 5.58L18.42 9.78"] } : { d: "M14.22 5.58L18.42 5.58L18.42 9.78" }}
        transition={{ duration: 0.8 / speed, times: [0, 0.25, 0.5, 0.72, 1], ease: "easeInOut" }}
      />
      <circle cx="10.78" cy="13.22" r="5.2" />
    </svg>
  );
}
