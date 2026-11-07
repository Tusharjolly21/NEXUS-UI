"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CloudSnowIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5ac8fa. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A cloud that settles as three snowflakes drift down, sway from side to side and fade back in from the cloud. */
export function CloudSnowIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CloudSnowIconProps) {
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
        d="M7.6 14.4a3.8 3.8 0 0 1 -0.5 -7.5A5.2 5.2 0 0 1 17.2 8.1a3.3 3.3 0 0 1 0.6 6.3z"
        initial={false}
        animate={on ? { y: [0, -0.5, 0] } : { y: 0 }}
        transition={on ? { duration: 0.6 / speed, repeat: 1, ease: "easeInOut" } : { duration: 0.2 / speed }}
      />
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        {([
          ["M8.4 17.1v2.4M7.36 17.7l2.08 1.2M7.36 18.9l2.08 -1.2", 0, 1.1],
          ["M15.6 17.1v2.4M14.56 17.7l2.08 1.2M14.56 18.9l2.08 -1.2", 0.2, -1.1],
          ["M12 19.1v2.4M10.96 19.7l2.08 1.2M10.96 20.9l2.08 -1.2", 0.1, 0.9],
        ] as [string, number, number][]).map(([d, dl, sw]) => (
          <motion.g
            key={d}
            initial={false}
            animate={on ? { y: [0, 3.4, -3.2, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
            transition={{ duration: 1.1 / speed, times: [0, 0.48, 0.5, 1], ease: "easeInOut", delay: (on ? dl : 0) / speed }}
          >
            <motion.path
              d={d}
              stroke={accent}
              strokeWidth={1.5}
              initial={false}
              animate={on ? { x: [0, sw, -sw, sw / 2, 0] } : { x: 0 }}
              transition={{ duration: 1.1 / speed, ease: "easeInOut", delay: (on ? dl : 0) / speed }}
            />
          </motion.g>
        ))}
      </svg>
    </svg>
  );
}
