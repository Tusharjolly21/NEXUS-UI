"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CommandIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The four loops of the command key light up one after another in the accent colour, then the key itself flashes as if pressed. */
export function CommandIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CommandIconProps) {
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
      {[
        "M9 9V6a3 3 0 1 0-3 3h3",
        "M15 9V6a3 3 0 1 1 3 3h-3",
        "M15 15v3a3 3 0 1 0 3-3h-3",
        "M9 15v3a3 3 0 1 1-3-3h3",
      ].map((d, i) => (
        <g key={i}>
          <path d={d} />
          <motion.path
            d={d}
            stroke={accent}
            initial={false}
            animate={on ? { pathLength: [0, 0, 1, 1], opacity: [0, 1, 1, 0] } : { pathLength: 1, opacity: 0 }}
            transition={{ duration: 0.42 / speed, times: [0, 0.01, 0.55, 1], delay: (on ? i * 0.14 : 0) / speed }}
          />
        </g>
      ))}
      <rect x="9" y="9" width="6" height="6" />
      <motion.rect
        x="9"
        y="9"
        width="6"
        height="6"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 0], scale: [1, 0.86, 1] } : { opacity: 0, scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.62 : 0) / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
