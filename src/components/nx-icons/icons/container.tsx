"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ContainerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Six crates drop into a pyramid row by row, bouncing a little as they land, and the accent crate drops in last on top. */
export function ContainerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ContainerIconProps) {
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
      {[
        { x: 3, y: 16.6, d: 0 },
        { x: 10, y: 16.6, d: 0.07 },
        { x: 17, y: 16.6, d: 0.14 },
        { x: 6.5, y: 9.8, d: 0.3 },
        { x: 13.5, y: 9.8, d: 0.37 },
        { x: 10, y: 3, d: 0.55, top: true },
      ].map((c) => (
        <motion.rect
          key={c.x + "-" + c.y}
          x={c.x}
          y={c.y}
          width="4"
          height="4"
          rx="1"
          stroke={c.top ? accent : "currentColor"}
          initial={false}
          animate={on ? { y: [-9, 0, 0.9, -0.3, 0], opacity: [0, 1, 1, 1, 1] } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.45 / speed, delay: (on ? c.d : 0) / speed, times: [0, 0.5, 0.7, 0.85, 1], ease: ["easeIn", "easeOut", "easeInOut", "easeOut"] }}
        />
      ))}
      </svg>
    </svg>
  );
}
