"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TelescopeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The telescope pans up to a star on its tripod, a sparkle blooms at the sky end of the tube, then it settles back. */
export function TelescopeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TelescopeIconProps) {
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
      <path d="M11.618 11.728V20.67M11.618 14.928L6.418 20.67M11.618 14.928L16.818 20.67" />
      <motion.g
        style={{ originX: "48.41%", originY: "48.867%" }}
        initial={false}
        animate={on ? { rotate: [0, -12, -12, -9, 0] } : { rotate: 0 }}
        transition={{ duration: 1.0 / speed, times: [0, 0.32, 0.55, 0.72, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="translate(10.5 10.07) rotate(-34)">
          <path d="M-6 0H-3" />
          <path d="M-3 -2V2H4V-2z" />
          <path d="M4 -2L7.6 -3V3L4 2" />
          <path d="M7.6 -3V3" stroke={accent} />
        </g>
      </motion.g>
      <g transform="translate(19.3 3.2)">
        <motion.path
          d="M0 -2.2 Q0.4 -0.4 2.2 0 Q0.4 0.4 0 2.2 Q-0.4 0.4 -2.2 0 Q-0.4 -0.4 0 -2.2z"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [0, 0, 1.25, 0.9, 1.1, 0], opacity: [0, 0, 1, 1, 1, 0], rotate: [0, 0, 0, 20, 45, 90] } : { scale: 0, opacity: 0 }}
          transition={{ duration: 1.0 / speed, times: [0, 0.3, 0.45, 0.6, 0.72, 0.92], ease: "easeOut" }}
        />
      </g>
    </svg>
  );
}
