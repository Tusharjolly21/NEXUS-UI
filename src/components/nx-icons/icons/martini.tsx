"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MartiniIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #32ade6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A martini glass in which the olive on its pick dips into the drink, then the glass tips for a clink and a sparkle. */
export function MartiniIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MartiniIconProps) {
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
        style={{ originX: "50%", originY: "87%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, 6, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.58, 0.8, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3 6h18L12 16z" />
        <path d="M12 16v5M8.5 21h7" />
        <path d="M8.94 12.6h6.12" stroke={accent} />
        <motion.g
          initial={false}
          animate={on ? { x: [0, -1, -1, 0], y: [0, 1, 1, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
        >
          <path d="M18.6 3 10 11.6" strokeWidth={1.4} />
          <circle cx="12.3" cy="9.3" r="1.9" fill={accent} stroke="none" />
          <path d="M13.6 8 10.9 10.7" strokeWidth={1.4} />
        </motion.g>
      </motion.g>
      <motion.path
        d="M5 1.1v3M3.5 2.6h3" strokeWidth={1.6}
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 0], scale: [0.4, 0.4, 1.2, 0.8] } : { opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.5, 0.65, 1] }}
      />
    </svg>
  );
}
