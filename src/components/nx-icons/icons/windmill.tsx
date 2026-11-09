"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WindmillIconProps = {
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

/** A windmill whose sails wind back a touch, then sweep a quarter turn and settle. */
export function WindmillIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WindmillIconProps) {
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
      <path d="M10.8 10.4 8.2 21H15.8L13.2 10.4" />
      <motion.g
        style={{ originX: "50%", originY: "36.67%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 95, 90] } : { rotate: 0 }}
        transition={on ? { duration: 0.95 / speed, times: [0, 0.16, 0.85, 1], ease: "easeInOut" } : { duration: 0 / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="rotate(45 12 8.8)" fill={accent} stroke={accent}>
          <path d="M12 8.8H18.6" strokeWidth={1.5} />
          <rect x="14.6" y="9.55" width="4" height="2.5" rx="0.4" stroke="none" />
        </g>
        <g transform="rotate(135 12 8.8)" fill={accent} stroke={accent}>
          <path d="M12 8.8H18.6" strokeWidth={1.5} />
          <rect x="14.6" y="9.55" width="4" height="2.5" rx="0.4" stroke="none" />
        </g>
        <g transform="rotate(225 12 8.8)" fill={accent} stroke={accent}>
          <path d="M12 8.8H18.6" strokeWidth={1.5} />
          <rect x="14.6" y="9.55" width="4" height="2.5" rx="0.4" stroke="none" />
        </g>
        <g transform="rotate(315 12 8.8)" fill={accent} stroke={accent}>
          <path d="M12 8.8H18.6" strokeWidth={1.5} />
          <rect x="14.6" y="9.55" width="4" height="2.5" rx="0.4" stroke="none" />
        </g>
      </motion.g>
      <circle cx="12" cy="8.8" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
