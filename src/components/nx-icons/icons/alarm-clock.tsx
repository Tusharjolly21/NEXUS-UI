"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AlarmClockIconProps = {
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

/** An alarm clock that shakes itself awake, bells ringing, with red ring marks flashing around it. */
export function AlarmClockIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AlarmClockIconProps) {
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
      <g transform="translate(0 -0.75)">
      <motion.g
        style={{ originX: "50%", originY: "62%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 8, -8, 8, -6, 6, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="13.4" r="6.8" />
        <path d="M12 9.8v3.8l2.4 1.4" />
        <path d="M6.8 19.2 5.2 21.2M17.2 19.2l1.6 2" />
        <path d="M4.4 7.6a4 4 0 0 1 3.2-3.4M19.6 7.6a4 4 0 0 0-3.2-3.4" stroke={accent} />
      </motion.g>
      <motion.path
        d="M2.2 4.6l1.5 1.1M21.8 4.6l-1.5 1.1M1.6 9.2h1.8M22.4 9.2h-1.8"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 0, 1, 0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.8 / speed }}
      />
      </g>
    </svg>
  );
}
