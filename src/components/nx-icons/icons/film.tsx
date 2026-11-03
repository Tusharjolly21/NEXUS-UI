"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FilmIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A film strip whose sprocket holes and frames scroll down past the window, the next frame sliding in from the top. */
export function FilmIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FilmIconProps) {
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
      <rect x="3" y="3.5" width="18" height="17" rx="2.4" />
      <svg x="4" y="4.5" width="16" height="15" viewBox="4 4.5 16 15" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { y: [0, 8.8, 0, 0] } : { y: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.78, 0.781, 1], ease: "easeInOut" }}
        >
          {[-1.2, 3.2, 7.6, 12, 16.4].map((y0) => (
            <path key={y0} d={`M6.2 ${y0}h.01M17.8 ${y0}h.01`} strokeWidth={1.8} />
          ))}
          <rect x="9.4" y="8.4" width="5.2" height="7.2" rx="1.2" stroke={accent} strokeWidth={1.6} />
          <motion.rect
            x="9.4"
            y="-0.4"
            width="5.2"
            height="7.2"
            rx="1.2"
            stroke={accent}
            strokeWidth={1.6}
            initial={false}
            animate={on ? { opacity: [0, 1, 1, 0, 0] } : { opacity: 0 }}
            transition={{ duration: 0.9 / speed, times: [0, 0.1, 0.78, 0.781, 1], ease: "linear" }}
          />
        </motion.g>
      </svg>
    </svg>
  );
}
