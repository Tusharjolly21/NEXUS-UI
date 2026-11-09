"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BiohazardIconProps = {
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

/** The whole three arm symbol turns exactly a third of a turn about its hub, winding back first, while the hub pulses. */
export function BiohazardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BiohazardIconProps) {
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
      <g transform="translate(0 1.2)">
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, -12, 120] } : { rotate: 0 }}
          transition={on ? { duration: 0.9 / speed, times: [0, 0.2, 1], ease: "easeInOut" } : { duration: 0 / speed }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M16.56 9.37A5.05 5.05 0 1 1 12 17.27A5.05 5.05 0 1 1 7.44 9.37A5.05 5.05 0 1 1 16.56 9.37z" />
          <g fill={accent} stroke="none">
            {[0, 120, 240].map((a) => (
              <path key={a} d="M9.05 9.18A3.55 3.55 0 1 1 14.95 9.18A2.95 2.95 0 0 0 9.05 9.18z" transform={`rotate(${a} 12 12)`} />
            ))}
          </g>
          {[0, 120, 240].map((a) => (
            <circle key={a} cx="12" cy="8.6" r="1.25" strokeWidth={strokeWidth * 0.5} transform={`rotate(${a} 12 12)`} />
          ))}
        </motion.g>
        <motion.circle
          cx="12"
          cy="12"
          r="1"
          fill="currentColor"
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 0.7, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.7, 1] }}
        />
      </g>
    </svg>
  );
}
