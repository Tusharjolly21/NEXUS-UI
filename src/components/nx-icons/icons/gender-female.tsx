"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GenderFemaleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff5fa2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The venus symbol swings like a pendant from the top of its ring and settles, the cross ringing out below. */
export function GenderFemaleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GenderFemaleIconProps) {
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
      <motion.g
        style={{ originX: "50%", originY: "15%" }}
        initial={false}
        animate={on ? { rotate: [0, 13, -10, 6, -2.5, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.18, 0.42, 0.64, 0.84, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 14.4V20.4M9 17.4H15" stroke={accent} />
        <circle cx="12" cy="9" r="5.4" />
      </motion.g>
    </svg>
  );
}
