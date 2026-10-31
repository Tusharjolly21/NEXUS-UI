"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SettingsIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A gear that turns a quarter and settles with a spring. */
export function SettingsIcon({ size = 24, strokeWidth = 2, className, play }: SettingsIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={{ rotate: on ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 14 }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M10.74 5.22L11 2.75L13 2.75L13.26 5.22L15.91 6.31L17.83 4.75L19.25 6.17L17.69 8.09L18.78 10.74L21.25 11L21.25 13L18.78 13.26L17.69 15.91L19.25 17.83L17.83 19.25L15.91 17.69L13.26 18.78L13 21.25L11 21.25L10.74 18.78L8.09 17.69L6.17 19.25L4.75 17.83L6.31 15.91L5.22 13.26L2.75 13L2.75 11L5.22 10.74L6.31 8.09L4.75 6.17L6.17 4.75L8.09 6.31Z" />
        <circle cx="12" cy="12" r="2.9" />
      </motion.g>
    </svg>
  );
}
