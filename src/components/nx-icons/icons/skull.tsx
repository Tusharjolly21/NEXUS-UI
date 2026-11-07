"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SkullIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A skull whose jaw clacks open and shut twice while its eye sockets glow. */
export function SkullIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SkullIconProps) {
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
      <path d="M6.27 13.92A7 7 0 1 1 17.73 13.92L16.5 16.9M6.27 13.92L7.5 16.9" />
      {[8.8, 15.2].map((x) => (
        <g key={x}>
          <circle cx={x} cy="10.3" r="2.1" fill="currentColor" stroke="none" />
          <motion.circle
            cx={x}
            cy="10.3"
            r="2.1"
            fill={accent}
            stroke="none"
            initial={false}
            animate={on ? { opacity: [0, 1, 0.35, 1, 0.35, 1, 0] } : { opacity: 0 }}
            transition={{ duration: 0.9 / speed }}
          />
        </g>
      ))}
      <path d="M12 12.6 10.9 14.4h2.2z" fill="currentColor" strokeWidth={1} />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 2, 0, 2, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <path d="M7.5 16.9V19.4a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V16.9Z" />
        <path d="M10.63 16.9V20.9M13.37 16.9V20.9" strokeWidth={1.2} />
      </motion.g>
    </svg>
  );
}
