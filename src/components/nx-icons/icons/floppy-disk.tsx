"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FloppyDiskIconProps = {
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

/** A floppy disk whose metal shutter slides aside as the label line turns into a check mark that says saved. */
export function FloppyDiskIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FloppyDiskIconProps) {
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
      <path d="M3 5a2 2 0 0 1 2-2h11.5L21 7.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -1.6, -1.6, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.25, 0.7, 1], ease: "easeInOut" }}
      >
        <path d="M7 3v6h7.5V3" />
        <path d="M12 5.4v1.2" stroke={accent} strokeWidth={1.6} />
      </motion.g>
      <path d="M7 21v-6.5a1.5 1.5 0 0 1 1.5-1.5h7a1.5 1.5 0 0 1 1.5 1.5V21" />
      <motion.path
        d="M9.8 17h4.4"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { opacity: [1, 0, 0, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.75, 0.95] }}
      />
      <motion.path
        d="M9.6 17.2l1.8 1.8 3.2-3.4"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { pathLength: [0, 0, 1, 1, 0], opacity: [0, 1, 1, 1, 0] } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.25, 0.5, 0.75, 0.95] }}
      />
    </svg>
  );
}
