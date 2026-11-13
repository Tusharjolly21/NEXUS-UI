"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AddressBookIconProps = {
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

/** The index tabs flick out one after another as if thumbed through, then the contact portrait pulses. */
export function AddressBookIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AddressBookIconProps) {
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
        d="M16.5 7H20.5"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, 1.2, 0] } : { x: 0 }}
        transition={{ duration: 0.3 / speed, delay: (on ? 0 : 0) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M16.5 12H20.5"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, 1.2, 0] } : { x: 0 }}
        transition={{ duration: 0.3 / speed, delay: (on ? 0.11 : 0) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M16.5 17H20.5"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, 1.2, 0] } : { x: 0 }}
        transition={{ duration: 0.3 / speed, delay: (on ? 0.22 : 0) / speed, ease: "easeInOut" }}
      />
      <rect x="3.5" y="3" width="13" height="18" rx="2" />
      <motion.g
        style={{ originX: "41.667%", originY: "70%" }}
        initial={false}
        animate={on ? { scale: [1, 1.12, 0.96, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.3 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="10" cy="8.4" r="2.2" />
        <path d="M6.3 17.2A3.7 3.7 0 0 1 13.7 17.2" />
      </motion.g>
    </svg>
  );
}
