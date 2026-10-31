"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CompassIconProps = {
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

/** A compass whose needle whirls, overshoots and settles with a few ticks, the north end in red. */
export function CompassIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CompassIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3.6v1.3M12 19.1v1.3M3.6 12h1.3M19.1 12h1.3" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [45, 490, 380, 420, 398, 405] } : { rotate: 45 }}
        transition={{ duration: 1.3 / speed, times: [0, 0.3, 0.5, 0.7, 0.88, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 5.4 14.3 12H9.7z" fill={accent} stroke={accent} />
        <path d="M12 18.6 14.3 12H9.7z" />
      </motion.g>
    </svg>
  );
}
