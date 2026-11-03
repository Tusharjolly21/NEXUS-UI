"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MoveIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A four way arrow whose heads push outward one after another, north, east, south, west, while a ring spreads from the centre dot. */
export function MoveIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MoveIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
      <path d="M12 3V21M3 12H21" />
      <motion.circle
        cx="12"
        cy="12"
        r="1.5"
        stroke={accent}
        strokeWidth={1.4}
        initial={false}
        animate={on ? { r: [1.5, 5], opacity: [0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.02) / speed, ease: "easeOut" }}
      />
      <circle cx="12" cy="12" r="1.5" fill={accent} stroke="none" />
      {[
        { a: 0, x: 0, y: -2.6, d: 0.0 },
        { a: 90, x: 2.6, y: 0, d: 0.1 },
        { a: 180, x: 0, y: 2.6, d: 0.2 },
        { a: 270, x: -2.6, y: 0, d: 0.3 },
      ].map((h) => (
        <motion.g
          key={h.a}
          initial={false}
          animate={on ? { x: [0, h.x, 0], y: [0, h.y, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.42 / speed, delay: (h.d) / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
        >
          <path d="M9 6l3-3 3 3" stroke={accent} transform={`rotate(${h.a} 12 12)`} />
          <path d="M12 3v4" transform={`rotate(${h.a} 12 12)`} />
        </motion.g>
      ))}
      </svg>
    </svg>
  );
}
