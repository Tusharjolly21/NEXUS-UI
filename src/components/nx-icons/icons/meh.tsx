"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MehIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #a2845e. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A face with a flat mouth whose eyes glance left, then right, and blink, with the mouth tilting as if shrugging. */
export function MehIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MehIconProps) {
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
      <circle cx="12" cy="12" r="9" />
      {[9, 15].map((x) => (
        <motion.circle
          key={x}
          cx={x}
          cy="9.6"
          r="1.15"
          fill="currentColor"
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { x: [0, -1.2, -1.2, 1.2, 1.2, 0], scaleY: [1, 1, 1, 1, 0.12, 1] } : { x: 0, scaleY: 1 }}
          transition={{
            x: { duration: 0.9 / speed, times: [0, 0.2, 0.4, 0.62, 0.8, 1], ease: "easeInOut" },
            scaleY: { duration: 0.9 / speed, times: [0, 0.7, 0.78, 0.85, 0.92, 1] },
          }}
        />
      ))}
      <motion.path
        d="M8.5 15.2h7"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -6, -6, 6, 6, 0], x: [0, 0.6, 0.6, -0.6, -0.6, 0] } : { rotate: 0, x: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.4, 0.62, 0.8, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
