"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TruckIconProps = {
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

/** A delivery truck that rattles along, with speed lines streaming behind it. */
export function TruckIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TruckIconProps) {
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
      <motion.g
        initial={false}
        animate={on ? { y: [0, -0.7, 0, -0.5, 0] } : { y: 0 }}
        transition={on ? { duration: 0.4 / speed, ease: "easeInOut", repeat: 4 } : { duration: 0.2 / speed }}
      >
        <path d="M5 7.2A1.2 1.2 0 0 1 6.2 6h7.6A1.2 1.2 0 0 1 15 7.2V16H5z" />
        <path d="M15 9.5h3.2l3 3.2V16H15z" />
        <circle cx="9" cy="17.2" r="1.9" />
        <circle cx="18" cy="17.2" r="1.9" />
      </motion.g>
      {[8.6, 11.8, 15].map((y, i) => (
        <motion.path
          key={y}
          d={`M${2.6 - (i % 2) * 0.8} ${y}h2`}
          stroke={accent}
          initial={false}
          animate={on ? { x: [0, -2.4], opacity: [0, 1, 0] } : { x: 0, opacity: 0 }}
          transition={on ? { duration: 0.6 / speed, ease: "easeOut", repeat: 2, delay: (i * 0.15) / speed } : { duration: 0.2 / speed }}
        />
      ))}
    </svg>
  );
}
