"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MinimizeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Four corner brackets that squeeze in towards the middle while the centre square pinches and rebounds. */
export function MinimizeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MinimizeIconProps) {
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
      <motion.rect
        x="10.5"
        y="10.5"
        width="3"
        height="3"
        rx="0.8"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.35, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }}
      />
      {[
        { d: "M9 4v3a2 2 0 0 1-2 2H4", x: 1.6, y: 1.6 },
        { d: "M20 9h-3a2 2 0 0 1-2-2V4", x: -1.6, y: 1.6 },
        { d: "M15 20v-3a2 2 0 0 1 2-2h3", x: -1.6, y: -1.6 },
        { d: "M4 15h3a2 2 0 0 1 2 2v3", x: 1.6, y: -1.6 },
      ].map((c) => (
        <motion.path
          key={c.d}
          d={c.d}
          initial={false}
          animate={on ? { x: [0, c.x, 0], y: [0, c.y, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.6 / speed, times: [0, 0.4, 1], ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
