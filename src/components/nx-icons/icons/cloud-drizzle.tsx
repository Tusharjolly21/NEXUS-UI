"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CloudDrizzleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A cloud that sways gently while five small drops fall softly one after another and reappear at the cloud. */
export function CloudDrizzleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CloudDrizzleIconProps) {
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
        d="M7 14.8a3.8 3.8 0 0 1-.5-7.5A5.2 5.2 0 0 1 16.6 8.5a3.3 3.3 0 0 1 .6 6.3z"
        initial={false}
        animate={on ? { x: [0, 0.5, 0, -0.4, 0] } : { x: 0 }}
        transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
      />
      {[
        { x: 8.6, y: 17.9, d: 0 },
        { x: 12, y: 17.9, d: 0.2 },
        { x: 15.4, y: 17.9, d: 0.4 },
        { x: 10.3, y: 20.9, d: 0.1 },
        { x: 13.7, y: 20.9, d: 0.3 },
      ].map((p) => (
        <motion.circle
          key={p.x + "-" + p.y}
          cx={p.x}
          cy={p.y}
          r="1"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { y: [0, 2.2, -1.6, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.45, 0.5, 1], ease: "easeInOut", delay: (on ? p.d : 0) / speed }}
        />
      ))}
    </svg>
  );
}
