"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VerifiedSealIconProps = {
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

/** The scalloped seal turns one notch like a stamp being pressed, and the tick inside draws itself fresh. */
export function VerifiedSealIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VerifiedSealIconProps) {
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
        animate={on ? { rotate: [0, 51, 45], scale: [1, 0.9, 1] } : { rotate: 0, scale: 1, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.6 / speed, times: [0, 0.65, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 2.7C12.29 2.7 12.61 2.84 12.88 3.04C13.15 3.23 13.4 3.58 13.62 3.86C13.84 4.14 14.01 4.5 14.2 4.73C14.4 4.97 14.56 5.16 14.79 5.26C15.02 5.35 15.28 5.33 15.58 5.3C15.88 5.28 16.26 5.14 16.61 5.1C16.97 5.05 17.39 4.98 17.71 5.04C18.04 5.09 18.37 5.22 18.58 5.42C18.78 5.63 18.91 5.96 18.96 6.29C19.02 6.61 18.95 7.03 18.9 7.39C18.86 7.74 18.72 8.12 18.7 8.42C18.67 8.72 18.65 8.98 18.74 9.21C18.84 9.44 19.03 9.6 19.27 9.8C19.5 9.99 19.86 10.16 20.14 10.38C20.42 10.6 20.77 10.85 20.96 11.12C21.16 11.39 21.3 11.71 21.3 12C21.3 12.29 21.16 12.61 20.96 12.88C20.77 13.15 20.42 13.4 20.14 13.62C19.86 13.84 19.5 14.01 19.27 14.2C19.03 14.4 18.84 14.56 18.74 14.79C18.65 15.02 18.67 15.28 18.7 15.58C18.72 15.88 18.86 16.26 18.9 16.61C18.95 16.97 19.02 17.39 18.96 17.71C18.91 18.04 18.78 18.37 18.58 18.58C18.37 18.78 18.04 18.91 17.71 18.96C17.39 19.02 16.97 18.95 16.61 18.9C16.26 18.86 15.88 18.72 15.58 18.7C15.28 18.67 15.02 18.65 14.79 18.74C14.56 18.84 14.4 19.03 14.2 19.27C14.01 19.5 13.84 19.86 13.62 20.14C13.4 20.42 13.15 20.77 12.88 20.96C12.61 21.16 12.29 21.3 12 21.3C11.71 21.3 11.39 21.16 11.12 20.96C10.85 20.77 10.6 20.42 10.38 20.14C10.16 19.86 9.99 19.5 9.8 19.27C9.6 19.03 9.44 18.84 9.21 18.74C8.98 18.65 8.72 18.67 8.42 18.7C8.12 18.72 7.74 18.86 7.39 18.9C7.03 18.95 6.61 19.02 6.29 18.96C5.96 18.91 5.63 18.78 5.42 18.58C5.22 18.37 5.09 18.04 5.04 17.71C4.98 17.39 5.05 16.97 5.1 16.61C5.14 16.26 5.28 15.88 5.3 15.58C5.33 15.28 5.35 15.02 5.26 14.79C5.16 14.56 4.97 14.4 4.73 14.2C4.5 14.01 4.14 13.84 3.86 13.62C3.58 13.4 3.23 13.15 3.04 12.88C2.84 12.61 2.7 12.29 2.7 12C2.7 11.71 2.84 11.39 3.04 11.12C3.23 10.85 3.58 10.6 3.86 10.38C4.14 10.16 4.5 9.99 4.73 9.8C4.97 9.6 5.16 9.44 5.26 9.21C5.35 8.98 5.33 8.72 5.3 8.42C5.28 8.12 5.14 7.74 5.1 7.39C5.05 7.03 4.98 6.61 5.04 6.29C5.09 5.96 5.22 5.63 5.42 5.42C5.63 5.22 5.96 5.09 6.29 5.04C6.61 4.98 7.03 5.05 7.39 5.1C7.74 5.14 8.12 5.28 8.42 5.3C8.72 5.33 8.98 5.35 9.21 5.26C9.44 5.16 9.6 4.97 9.8 4.73C9.99 4.5 10.16 4.14 10.38 3.86C10.6 3.58 10.85 3.23 11.12 3.04C11.39 2.84 11.71 2.7 12 2.7Z" />
      </motion.g>
      <motion.path
        d="M8.3 12.2L10.9 14.8L15.7 9.8"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [1, 0, 0, 1, 1], opacity: [1, 1, 0, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.9 / speed, times: [0, 0.15, 0.5, 0.82, 1], ease: "easeInOut" },
          opacity: { duration: 0.9 / speed, times: [0, 0.14, 0.15, 0.52, 0.54, 1], ease: "linear" },
        }}
      />
    </svg>
  );
}
