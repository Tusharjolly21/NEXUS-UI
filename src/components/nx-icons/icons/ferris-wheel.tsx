"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FerrisWheelIconProps = {
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

/** A ferris wheel that turns a sixth of a revolution, its gondolas hanging from the rim. */
export function FerrisWheelIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FerrisWheelIconProps) {
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
<g transform="translate(0 0.12)">
      <path d="M13 13.43L17.66 21.5M11 13.43L6.34 21.5" strokeWidth={strokeWidth * 0.75} />
      <motion.g
        style={{ originX: "50%", originY: "48.75%" }}
        initial={false}
        animate={on ? { rotate: [0, 60] } : { rotate: 0, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="19.62" cy="16.1" r="1.4" fill={accent} stroke="none" />
        <circle cx="12" cy="20.5" r="1.4" fill={accent} stroke="none" />
        <circle cx="4.38" cy="16.1" r="1.4" fill={accent} stroke="none" />
        <circle cx="4.38" cy="7.3" r="1.4" fill={accent} stroke="none" />
        <circle cx="12" cy="2.9" r="1.4" fill={accent} stroke="none" />
        <circle cx="19.62" cy="7.3" r="1.4" fill={accent} stroke="none" />
        <path d="M17.07 14.62L18.6 15.51M12 17.55L12 19.32M6.93 14.62L5.4 15.51M6.93 8.77L5.4 7.89M12 5.85L12 4.08M17.07 8.77L18.6 7.89" strokeWidth={strokeWidth * 0.75} strokeLinecap="butt" />
        <path d="M14 11.7L17.85 11.7M13 13.43L14.93 16.77M11 13.43L9.08 16.77M10 11.7L6.15 11.7M11 9.97L9.07 6.63M13 9.97L14.93 6.63" strokeWidth={strokeWidth * 0.5} />
        <circle cx="12" cy="11.7" r="5.85" strokeWidth={strokeWidth * 0.75} />
        <circle cx="12" cy="11.7" r="2" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
</g>
    </svg>
  );
}
