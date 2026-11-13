"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FerryIconProps = {
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

/** A ferry that rocks on the swell, puffing smoke while the waves ripple beneath it. */
export function FerryIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FerryIconProps) {
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
<g transform="translate(0 -0.48)">
      <motion.circle
        cx="12"
        cy="3.2"
        r="0.95"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { x: [0, 1.6, 3.4], y: [0, -0.8, -1.5], scale: [0.5, 1.2, 1.5], opacity: [0, 0.95, 0] } : { opacity: 0 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="12"
        cy="3.2"
        r="0.95"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { x: [0, 1.6, 3.4], y: [0, -0.8, -1.5], scale: [0.5, 1.2, 1.5], opacity: [0, 0.95, 0] } : { opacity: 0 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.45 : 0) / speed, ease: "easeOut" }}
      />
      <motion.g
        style={{ originX: "50%", originY: "85.83%" }}
        initial={false}
        animate={on ? { rotate: [0, -3, 2.5, -1.4, 0], y: [0, 0.5, -0.4, 0.2, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M6.5 13V8H17.5V13" />
        <path d="M10.7 8V3.8H13.3V8" />
        <path d="M3 13H21L18.9 17.2H5.1Z" />
        <circle cx="9.6" cy="10.5" r="0.85" fill="currentColor" stroke="none" /><circle cx="12" cy="10.5" r="0.85" fill="currentColor" stroke="none" /><circle cx="14.4" cy="10.5" r="0.85" fill="currentColor" stroke="none" />
      </motion.g>
      <motion.path
        d="M3 20.6q1.5-1.2 3 0t3 0t3 0t3 0t3 0t3 0"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M3 20.6q1.5-1.2 3 0t3 0t3 0t3 0t3 0t3 0", "M3 20.6q1.5 1.2 3 0t3 0t3 0t3 0t3 0t3 0", "M3 20.6q1.5-1.2 3 0t3 0t3 0t3 0t3 0t3 0", "M3 20.6q1.5 1.2 3 0t3 0t3 0t3 0t3 0t3 0", "M3 20.6q1.5-1.2 3 0t3 0t3 0t3 0t3 0t3 0"] } : { d: "M3 20.6q1.5-1.2 3 0t3 0t3 0t3 0t3 0t3 0" }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
</g>
    </svg>
  );
}
