"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UnlockIconProps = {
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

/** An open padlock whose shackle snaps shut with a click, then springs open again. */
export function UnlockIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UnlockIconProps) {
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
      <motion.path
        d="M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2V7.6"
        stroke={accent}
        initial={false}
        animate={{ d: on ? ["M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2V7.6", "M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11", "M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11", "M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2V7.6"] : "M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2V7.6" }}
        transition={{ duration: 0.8 / speed, times: [0, 0.35, 0.55, 1], ease: "easeInOut" }}
      />
      <rect x="5" y="11" width="14" height="10" rx="2.4" />
      <motion.circle
        cx="12"
        cy="16"
        r="1.2"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 1.9, 1] } : { scale: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.35, 0.55, 1] }}
      />
    </svg>
  );
}
