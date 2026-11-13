"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ThoughtBubbleIconProps = {
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

/** Two small bubbles pop up one after another and the cloud puffs out while its three dots hop in turn. */
export function ThoughtBubbleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ThoughtBubbleIconProps) {
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
      <g transform="translate(0 0.25)">
      <motion.g style={{ originX: "20.42%", originY: "85.83%" }} initial={false} animate={on ? { scale: [1, 0, 1.3, 1], opacity: [1, 0, 1, 1] } : { scale: 1, opacity: 1 }} transition={{ duration: 0.45 / speed, times: [0, 0.12, 0.6, 1], ease: "easeOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <circle cx="4.9" cy="20.6" r="1.1" fill={accent} stroke="none" />
      </motion.g>
      <motion.g style={{ originX: "30.83%", originY: "70.42%" }} initial={false} animate={on ? { scale: [1, 0, 1.3, 1], opacity: [1, 0, 1, 1] } : { scale: 1, opacity: 1 }} transition={{ duration: 0.45 / speed, times: [0, 0.12, 0.6, 1], ease: "easeOut", delay: (0.1) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <circle cx="7.4" cy="16.9" r="1.7" fill={accent} stroke="none" />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "35%" }} initial={false} animate={on ? { scale: [1, 1.07, 0.98, 1] } : { scale: 1 }} transition={{ duration: 0.7 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut", delay: (0.2) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M12 3.7A3.44 3.44 0 0 1 17.58 5.03A3.44 3.44 0 0 1 19.64 9.79A3.44 3.44 0 0 1 14.87 12.79A3.44 3.44 0 0 1 9.13 12.79A3.44 3.44 0 0 1 4.36 9.79A3.44 3.44 0 0 1 6.42 5.03A3.44 3.44 0 0 1 12 3.7"  />
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, -1.6, 0] } : { y: 0 }} transition={{ duration: 0.35 / speed, ease: "easeInOut", delay: (0.25) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M8.8 8.6h.01"  />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, -1.6, 0] } : { y: 0 }} transition={{ duration: 0.35 / speed, ease: "easeInOut", delay: (0.35) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M12 8.6h.01"  />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, -1.6, 0] } : { y: 0 }} transition={{ duration: 0.35 / speed, ease: "easeInOut", delay: (0.45) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M15.2 8.6h.01"  />
      </motion.g>
      </motion.g>
      </g>
    </svg>
  );
}
