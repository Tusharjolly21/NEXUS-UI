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

/** The brain swells gently while an accent pulse runs along one fold from the outline inwards. */
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
      <g transform="translate(-0.29 1.12)">
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.05, 1, 1.03, 1] } : { scale: 1 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M7.33 4.74C6.18 6.89 9.19 8.45 8 10.3M12 3.8C13.4 5.8 10.6 7.7 12 9.4M16.67 4.74C15.04 6.56 17.59 8.78 16 10.3" strokeWidth={strokeWidth * 0.8} />
          <motion.path
            d="M12 3.8C13.4 5.8 10.6 7.7 12 9.4"
            stroke={accent}
            strokeWidth={strokeWidth * 0.8}
            initial={false}
            animate={on ? { pathLength: 0.3, pathOffset: [-0.3, 1], opacity: [0, 0, 1, 1, 0] } : { pathLength: 0.3, pathOffset: -0.3, opacity: 0 }}
            transition={{ pathOffset: { duration: 0.8 / speed, delay: (0.05) / speed, ease: "linear" }, opacity: { duration: 0.8 / speed, delay: (0.05) / speed, times: [0, 0.16, 0.26, 0.85, 1], ease: "linear" } }}
          />
          <path d="M15.83 15.58L15.83 17.98" />
          <path d="M16.67 4.74A8.8 6.2 0 0 1 20.75 10.71A2.84 2 0 0 0 21.04 11.85A2.98 2.1 0 0 1 18.33 14.91A2.84 2 0 0 0 16.74 15.22A8.8 6.2 0 0 1 14.86 15.86A2.84 2 0 0 0 13.57 16.51A4.26 3 0 0 1 6.02 15.08A2.84 2 0 0 0 5.36 14.07A8.8 6.2 0 0 1 7.33 4.74A2.77 1.95 0 0 1 9.79 4.57A2.77 1.95 0 0 1 14.21 4.57A2.77 1.95 0 0 1 16.67 4.74Z" />
        </motion.g>
      </g>
    </svg>
  );
}
