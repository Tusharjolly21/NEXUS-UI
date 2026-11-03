"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VoicemailIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff2d92. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two tape reels spin round while the tape line between them sags and flutters. */
export function VoicemailIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VoicemailIconProps) {
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
      {[6.6, 17.4].map((cx) => (
        <motion.g
          key={cx}
          style={{ originX: `${(cx / 24) * 100}%`, originY: "43.3%" }}
          initial={false}
          animate={on ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx={cx} cy="10.4" r="3.6" />
          {[0, 120, 240].map((a) => (
            <path key={a} d={`M${cx} 10.4V9.1`} stroke={accent} strokeWidth={1.2} transform={`rotate(${a} ${cx} 10.4)`} />
          ))}
        </motion.g>
      ))}
      <motion.path
        d="M6.6 17.8Q12 17.8 17.4 17.8"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M6.6 17.8Q12 17.8 17.4 17.8", "M6.6 17.8Q12 19.6 17.4 17.8", "M6.6 17.8Q12 16.4 17.4 17.8", "M6.6 17.8Q12 19 17.4 17.8", "M6.6 17.8Q12 17.2 17.4 17.8", "M6.6 17.8Q12 17.8 17.4 17.8"] } : { d: "M6.6 17.8Q12 17.8 17.4 17.8" }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
