"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FrownIconProps = {
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

/** A face whose eyes sink and mouth corners droop, while a tear forms under one eye and rolls down. */
export function FrownIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FrownIconProps) {
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
          animate={on ? { scaleY: [1, 0.55, 0.55, 1], y: [0, 0.5, 0.5, 0] } : { scaleY: 1, y: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.3, 0.75, 1], ease: "easeInOut" }}
        />
      ))}
      <motion.path
        d="M8 16.4a5 5 0 0 1 8 0"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M8 16.4a5 5 0 0 1 8 0", "M8 17.5a4.2 4.2 0 0 1 8 0", "M8 17.5a4.2 4.2 0 0 1 8 0", "M8 16.4a5 5 0 0 1 8 0"] } : { d: "M8 16.4a5 5 0 0 1 8 0" }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 0.75, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M16.5 11.3 15.4 12.9a1.3 1.3 0 1 0 2.2 0z"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "0%" }}
        initial={false}
        animate={on ? { y: [0, 0, 1.4], opacity: [0, 1, 0], scale: [0.3, 1, 1] } : { y: 0, opacity: 0, scale: 0.3 }}
        transition={{ duration: 0.7 / speed, delay: (on ? 0.25 : 0) / speed, times: [0, 0.3, 1], ease: "easeIn" }}
      />
    </svg>
  );
}
