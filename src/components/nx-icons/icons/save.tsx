"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SaveIconProps = {
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

/** A floppy disk whose label tray slips up and clicks back down as it saves. */
export function SaveIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SaveIconProps) {
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
        d="M7 3v5h8"
        initial={false}
        animate={on ? { y: [0, 1.2, 0] } : { y: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M17 21v-8H7v8"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, -2, 0] } : { y: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      />
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    </svg>
  );
}
