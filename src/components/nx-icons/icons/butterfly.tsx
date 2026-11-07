"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ButterflyIconProps = {
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

/** A butterfly that floats up a little as its wings flap twice. */
export function ButterflyIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ButterflyIconProps) {
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
        animate={on ? { y: [0, -1.5, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <path d="M12 9.13L12 17.73" strokeWidth={2.4} />
        <path d="M12 8.53C12 6.93 11.2 5.73 10.2 4.93M12 8.53C12 6.93 12.8 5.73 13.8 4.93" strokeWidth={1.4} />
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scaleX: [1, 0.28, 1, 0.28, 1] } : { scaleX: 1 }}
          transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M13.5 11.53C14.2 8.93 16.2 5.13 19 4.13C21.6 3.33 22 7.73 20 10.23C18.4 12.23 15.8 12.53 13.5 12.33" />
          <path d="M10.5 11.53C9.8 8.93 7.8 5.13 5 4.13C2.4 3.33 2 7.73 4 10.23C5.6 12.23 8.2 12.53 10.5 12.33" />
          <path d="M13.5 14.33C12.17 17.01 16.29 20.11 19.6 19.93C19.5 16.61 16.05 12.77 13.5 14.33" stroke={accent} />
          <path d="M10.5 14.33C11.83 17.01 7.71 20.11 4.4 19.93C4.5 16.61 7.95 12.77 10.5 14.33" stroke={accent} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
