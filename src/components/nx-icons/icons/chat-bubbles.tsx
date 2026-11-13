"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChatBubblesIconProps = {
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

/** Two speech bubbles answer each other: the first pops, then the second pops back and its line writes itself. */
export function ChatBubblesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChatBubblesIconProps) {
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
      <g transform="translate(0 -0.25)">
      <motion.g style={{ originX: "35.42%", originY: "26.04%" }} initial={false} animate={on ? { scale: [1, 1.1, 0.97, 1] } : { scale: 1 }} transition={{ duration: 0.45 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M5.3 3L11.7 3A2.8 2.8 0 0 1 14.5 5.8L14.5 6.7A2.8 2.8 0 0 1 11.7 9.5L6.1 9.5L2.5 12.1L2.5 5.8A2.8 2.8 0 0 1 5.3 3Z"  />
      <path d="M6.2 6.25L10.8 6.25"  />
      </motion.g>
      <motion.g style={{ originX: "64.58%", originY: "67.71%" }} initial={false} animate={on ? { scale: [1, 1.1, 0.97, 1] } : { scale: 1 }} transition={{ duration: 0.45 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut", delay: (0.4) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M12.3 13L18.7 13A2.8 2.8 0 0 1 21.5 15.8L21.5 21.5L17.9 19.5L12.3 19.5A2.8 2.8 0 0 1 9.5 16.7L9.5 15.8A2.8 2.8 0 0 1 12.3 13Z"  />
      <motion.g style={{ originX: "64.58%", originY: "67.71%" }} initial={false} animate={on ? { scaleX: [1, 0.3, 1] } : { scaleX: 1 }} transition={{ duration: 0.3 / speed, ease: "easeOut", delay: (0.55) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M13.2 16.25L17.8 16.25" stroke={accent} />
      </motion.g>
      </motion.g>
      </g>
    </svg>
  );
}
