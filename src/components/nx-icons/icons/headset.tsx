"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HeadsetIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A headset whose mic boom swings out and back while both ear cups pulse. */
export function HeadsetIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HeadsetIconProps) {
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
      <g transform="translate(0 0.25)">
      <motion.g
        style={{ originX: "20.83%", originY: "75%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1.2, 1, 1.2, 1], scaleY: [1, 1.12, 1, 1.12, 1] } : { scaleX: 1, scaleY: 1 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.5 : 0) / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="2.75" y="11" width="4.5" height="7" rx="2" />
      </motion.g>
      <motion.g
        style={{ originX: "79.17%", originY: "75%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1.2, 1, 1.2, 1], scaleY: [1, 1.12, 1, 1.12, 1] } : { scaleX: 1, scaleY: 1 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.5 : 0) / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="16.75" y="11" width="4.5" height="7" rx="2" />
      </motion.g>
      <path d="M5 11V9.5a7 7 0 0 1 14 0V11" />
      <motion.g
        style={{ originX: "20.83%", originY: "75%" }}
        initial={false}
        animate={on ? { rotate: [0, -26, 7, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M5 18v.75a1.75 1.75 0 0 0 1.75 1.75h3" stroke={accent} />
        <path d="M11.25 20.5h.01" stroke={accent} strokeWidth={3} />
      </motion.g>
      </g>
    </svg>
  );
}
