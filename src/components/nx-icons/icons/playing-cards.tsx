"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PlayingCardsIconProps = {
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

/** The front card is dealt out to the side and snaps back while its heart pulses. */
export function PlayingCardsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PlayingCardsIconProps) {
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
      <g transform="translate(0.66 0.57)">
      <path d="M3.2 -7H-3.2A1.8 1.8 0 0 0 -5 -5.2V5.2A1.8 1.8 0 0 0 -4.61 6.32" transform="translate(9.2 9.4) rotate(-10)" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 2, 0, 0], y: [0, -1.8, 0, 0], rotate: [0, 6, 0, 0] } : { x: 0, y: 0, rotate: 0 }}
        style={{ originX: "13.8px", originY: "13.6px" }}
        transition={{ duration: 0.8 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="rotate(6 13.8 13.6)">
          <rect x="8.8" y="6.6" width="10" height="14" rx="1.8" />
          <g transform="translate(13.8 13.6) scale(0.82)">
            <motion.path
              d="M0 3.1C-1.2 2.1-3.2 .8-3.2-1.1A1.75 1.75 0 0 1 0-1.7A1.75 1.75 0 0 1 3.2-1.1C3.2 .8 1.2 2.1 0 3.1z"
              fill={accent}
              stroke={accent}
              strokeWidth={1}
              initial={false}
              animate={on ? { scale: [1, 1.22, 1, 1.12, 1] } : { scale: 1 }}
              style={{ originX: "50%", originY: "50%" }}
              transition={{ duration: 0.8 / speed, times: [0, 0.4, 0.62, 0.8, 1] }}
            />
          </g>
        </g>
      </motion.g>
      </g>
    </svg>
  );
}
