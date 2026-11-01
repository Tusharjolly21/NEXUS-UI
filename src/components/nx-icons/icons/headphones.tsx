"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HeadphonesIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Headphones whose ear cups throb with the beat, glowing purple on every thump. */
export function HeadphonesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HeadphonesIconProps) {
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
      <path d="M4 14.5V12a8 8 0 0 1 16 0v2.5" />
      {[3.5, 16.5].map((x) => (
        <motion.rect
          key={x}
          x={x}
          y="14"
          width="4"
          height="6.5"
          rx="1.6"
          fill={accent}
          initial={false}
          animate={on ? { scale: [1, 1.14, 1, 1.14, 1], fillOpacity: [0, 0.55, 0, 0.55, 0] } : { scale: 1, fillOpacity: 0 }}
          transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
