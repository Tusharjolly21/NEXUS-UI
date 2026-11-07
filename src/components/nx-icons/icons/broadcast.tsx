"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BroadcastIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A live dot with signal arcs on both sides that pulse outward in turn, inner arcs first and then the outer ones. */
export function BroadcastIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BroadcastIconProps) {
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
      <motion.circle
        cx="12"
        cy="12"
        r="2.1"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.35, 1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed }}
      />
      {([
        ["M15.86 8.52A5.2 5.2 0 0 1 15.86 15.48", 0, accent],
        ["M8.14 15.48A5.2 5.2 0 0 1 8.14 8.52", 0.06, accent],
        ["M19.06 5.64A9.5 9.5 0 0 1 19.06 18.36", 0.28, "currentColor"],
        ["M4.94 18.36A9.5 9.5 0 0 1 4.94 5.64", 0.34, "currentColor"],
      ] as [string, number, string][]).map(([d, dl, col], i) => (
        <motion.path
          key={i}
          d={d}
          stroke={col}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { opacity: [1, 0.1, 1], scale: [1, 1.14, 1] } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 / speed, delay: (dl) / speed, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
