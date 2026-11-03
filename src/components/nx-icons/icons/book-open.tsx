"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BookOpenIconProps = {
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

/** An open book whose right-hand page lifts, sweeps across the spine and settles as the next page falls into place. */
export function BookOpenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BookOpenIconProps) {
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
      <g transform="translate(0 -1.0)">
      <path d="M3.2 16.8v2.4C7 18.6 10.2 19 12 20.4 13.8 19 17 18.6 20.8 19.2v-2.4" />
      <path d="M12 7.2C10.2 5.6 7 5.2 3.2 5.8V16.8C7 16.2 10.2 16.6 12 18.2 13.8 16.6 17 16.2 20.8 16.8V5.8C17 5.2 13.8 5.6 12 7.2zM12 7.2V18.2" />
      <path d="M6.2 9.2c1.3-.1 2.6 0 3.6.5M6.2 12.4c1.3-.1 2.6 0 3.6.5M17.8 9.2c-1.3-.1-2.6 0-3.6.5M17.8 12.4c-1.3-.1-2.6 0-3.6.5" stroke={accent} strokeWidth={1.6} />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, -1, -1, 1, 1], skewY: [0, -10, 0, 10, 0, 0], opacity: [1, 1, 0, 0, 1, 1] } : { scaleX: 1, skewY: 0, opacity: 1 }}
        transition={{
          scaleX: { duration: 0.9 / speed, times: [0, 0.55, 0.8, 0.801, 1], ease: "easeInOut" },
          skewY: { duration: 0.9 / speed, times: [0, 0.15, 0.27, 0.4, 0.55, 1], ease: "easeInOut" },
          opacity: { duration: 0.9 / speed, times: [0, 0.55, 0.78, 0.8, 0.801, 1], ease: "linear" },
        }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 7.2C13.8 5.6 17 5.2 20.8 5.8V16.8C17 16.2 13.8 16.6 12 18.2z" />
        <path d="M17.8 9.2c-1.3-.1-2.6 0-3.6.5M17.8 12.4c-1.3-.1-2.6 0-3.6.5" stroke={accent} strokeWidth={1.6} />
      </motion.g>
      </g>
    </svg>
  );
}
