"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BrainIconProps = {
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

/** A thought pulse runs along the folds of the brain and a spark pops from its crown. */
export function BrainIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BrainIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.05, 1, 1.03, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.6 12.2A3.3 3.3 0 0 1 4.6 7A3.8 3.8 0 0 1 9.8 4A3.9 3.9 0 0 1 15.4 4.4A3.6 3.6 0 0 1 20.2 8.4A3.2 3.2 0 0 1 19.4 13.6A2.6 2.6 0 0 1 15.4 16.4H9.6C6.6 16.4 4.2 14.8 3.6 12.2z" />
        <path d="M12.6 16.4V20.4" />
        <path d="M9.8 4C11.6 6.2 10 8.4 11.6 10.4M3.6 12.2C5.8 10.6 7.2 12 8.8 11.6M20.2 8.4C18.6 9 17.6 10.6 15.6 10.8" />
        <motion.path
          d="M9.8 4C11.6 6.2 10 8.4 11.6 10.4M3.6 12.2C5.8 10.6 7.2 12 8.8 11.6M20.2 8.4C18.6 9 17.6 10.6 15.6 10.8"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: 0.22, pathOffset: [-0.22, 1], opacity: [0, 1, 1, 0] } : { pathLength: 0.22, pathOffset: -0.22, opacity: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.05) / speed, times: [0, 0.1, 0.85, 1], ease: "easeInOut" }}
        />
      </motion.g>
      <motion.g
        stroke={accent}
        strokeWidth={1.6}
        style={{ originX: "80.83%", originY: "20%" }}
        initial={false}
        animate={on ? { scale: [0, 1.25, 1, 0], opacity: [0, 1, 1, 0] } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.55 / speed, delay: (0.5) / speed, times: [0, 0.35, 0.7, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M19.4 2.9L19.4 1.5M20.74 3.46L21.73 2.47M21.3 4.8L22.7 4.8" />
      </motion.g>
    </svg>
  );
}
