"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PaperclipIconProps = {
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

/** A paperclip that hops and wobbles as it clips onto something. */
export function PaperclipIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PaperclipIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
      <motion.path
        d="M20.2 11.3 12 19.5a5 5 0 0 1-7.1-7.1l8.9-8.9a3.4 3.4 0 0 1 4.8 4.8l-8.9 8.9a1.7 1.7 0 0 1-2.4-2.4l8-8"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -14, 10, -4, 0], y: [0, -1.6, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
