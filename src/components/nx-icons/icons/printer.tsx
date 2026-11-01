"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PrinterIconProps = {
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

/** A printer that shudders as a sheet of paper slides out. */
export function PrinterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PrinterIconProps) {
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
      <motion.g
        initial={false}
        animate={on ? { y: [0, 0.4, 0, 0.4, 0, 0.4, 0] } : { y: 0 }}
        transition={{ duration: 0.6 / speed }}
      >
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      </motion.g>
      <motion.path
        d="M6 14h12v8H6z"
        stroke={accent}
        initial={false}
        animate={on ? { y: [-5, 0], opacity: [0, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
