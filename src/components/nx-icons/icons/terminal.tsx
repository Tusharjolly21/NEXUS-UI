"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TerminalIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A terminal window where a command is typed and the cursor blinks. */
export function TerminalIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TerminalIconProps) {
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
      <rect x="3" y="4.5" width="18" height="15" rx="2.6" />
      <path d="M7 10l3 2.5-3 2.5" stroke={accent} />
      <motion.path
        d="M12.5 15.2H17"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [1, 1, 0, 1, 0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.4, 0.55, 0.7, 0.85, 1] }}
      />
    </svg>
  );
}
