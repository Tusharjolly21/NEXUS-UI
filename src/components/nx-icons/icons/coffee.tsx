"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CoffeeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #c2763b. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A cup of coffee that settles on its saucer while steam curls up from it. */
export function CoffeeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CoffeeIconProps) {
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
        animate={on ? { y: [-1.2, 0.5, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed, ease: "easeOut" }}
      >
        <path d="M5 9.4h11v5.2a4.4 4.4 0 0 1-4.4 4.4H9.4A4.4 4.4 0 0 1 5 14.6z" />
        <path d="M16 10.8h1.4a2.5 2.5 0 0 1 0 5H16" />
        <path d="M3.8 21.2h13.4" />
      </motion.g>
      {[8.2, 10.8, 13.4].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 6.4c-.9-1 .9-1.8 0-2.8`}
          stroke={accent}
          initial={false}
          animate={on ? { y: [2, -2], opacity: [0, 1, 0] } : { y: 0, opacity: 0.8 }}
          transition={on ? { duration: 0.8 / speed, repeat: 1, delay: (0.2 + i * 0.18) / speed, ease: "easeOut" } : { duration: 0.2 / speed }}
        />
      ))}
    </svg>
  );
}
