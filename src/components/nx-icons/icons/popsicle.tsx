"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PopsicleIconProps = {
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

/** An ice lolly that wobbles on its stick while a drip stretches, lets go and falls, then grows back. */
export function PopsicleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PopsicleIconProps) {
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
        style={{ originX: "50%", originY: "88%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 4, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7 13.75V7.75A5 5 0 0 1 13.676 3.039A2.2 2.2 0 0 0 16.711 6.074A5 5 0 0 1 17 7.75V13.75a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5z" />
        <path d="M12 15.25v6" />
        <path d="M9.6 8.8v3.8" stroke={accent} />
        <motion.path
          d="M15.2 15.6C15.2 16.8 13.9 17.5 13.9 18.6a1.3 1.3 0 0 0 2.6 0C16.5 17.5 15.2 16.8 15.2 15.6z"
          fill={accent}
          stroke="none"
          style={{ originX: "63%", originY: "66%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1.3, 1.3, 0.3, 0.3, 1], scaleX: [1, 0.85, 0.85, 0.6, 0.6, 1] } : { scaleY: 1, scaleX: 1 }}
          transition={{ duration: 1.05 / speed, times: [0, 0.3, 0.45, 0.6, 0.72, 1], ease: "easeInOut" }}
        />
        <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
          <motion.circle
            cx="15.2"
            cy="19.2"
            r="1.2"
            fill={accent}
            stroke="none"
            initial={false}
            animate={on ? { y: [0, 0, 1, 4.4], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
            transition={{ duration: 0.6 / speed, delay: (0.45) / speed, times: [0, 0.01, 0.4, 1], ease: "easeIn" }}
          />
        </svg>
      </motion.g>
    </svg>
  );
}
