"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HeartIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A heart that beats and fills in, while three little hearts float away from it. */
export function HeartIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HeartIconProps) {
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
      {[7.5, 12, 16.5].map((x, i) => (
        <g key={x} transform={`translate(${x} 8)`}>
          <motion.path
            d="M0 1.7C-2.4 0-3-1-3-1.8a1.5 1.5 0 0 1 3-.4 1.5 1.5 0 0 1 3 .4c0 .8-.6 1.8-3 3.5z"
            fill={accent}
            stroke="none"
            initial={{ opacity: 0, y: 0, scale: 0.4 }}
            animate={on ? { y: [0, -5.6], opacity: [0, 1, 0], scale: [0.4, 1, 0.8] } : { opacity: 0, y: 0, scale: 0.4 }}
            transition={on ? { duration: 0.8 / speed, ease: "easeOut", delay: (0.12 + i * 0.1) / speed } : { duration: 0.1 / speed }}
          />
        </g>
      ))}
      <motion.path
        d="M12 20.2C6.2 16 3.2 12.8 3.2 9.2A4.7 4.7 0 0 1 12 7.1a4.7 4.7 0 0 1 8.8 2.1c0 3.6-3 6.8-8.8 11z"
        fill={accent}
        initial={false}
        animate={on ? { scale: [1, 1.22, 0.94, 1.12, 1], fillOpacity: 1 } : { scale: 1, fillOpacity: 0 }}
        transition={{ scale: { duration: 0.7 / speed, ease: "easeInOut" }, fillOpacity: { duration: 0.25 / speed } }}
      />
    </svg>
  );
}
