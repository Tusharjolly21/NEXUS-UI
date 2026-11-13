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

/** A ferris wheel that turns a sixth of a revolution, its gondolas riding round the rim. */
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
<g transform="translate(0 -0.27)">
      <motion.g
        style={{ originX: "50%", originY: "41.67%" }}
        initial={false}
        animate={on ? { rotate: [0, 60] } : { rotate: 0, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="15.1" cy="4.63" r="2.4" fill={accent} stroke="none" />
        <circle cx="18.2" cy="10" r="2.4" fill={accent} stroke="none" />
        <circle cx="15.1" cy="15.37" r="2.4" fill={accent} stroke="none" />
        <circle cx="8.9" cy="15.37" r="2.4" fill={accent} stroke="none" />
        <circle cx="5.8" cy="10" r="2.4" fill={accent} stroke="none" />
        <circle cx="8.9" cy="4.63" r="2.4" fill={accent} stroke="none" />
      </motion.g>
      <path d="M18.64 21.5L12 10L5.36 21.5" strokeWidth={strokeWidth * 0.75} />
      <motion.g
        style={{ originX: "50%", originY: "41.67%" }}
        initial={false}
        animate={on ? { rotate: [0, 60] } : { rotate: 0, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 10L15.1 4.63M12 10L18.2 10M12 10L15.1 15.37M12 10L8.9 15.37M12 10L5.8 10M12 10L8.9 4.63" strokeWidth={strokeWidth * 0.75} />
        <circle cx="12" cy="10" r="6.2" />
        <circle cx="12" cy="10" r="2.1" fill="currentColor" stroke="none" />
      </motion.g>
</g>
    </svg>
  );
}
