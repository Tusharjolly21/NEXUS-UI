"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChargingStationIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An EV charger whose bolt pulses while the cable draws out to the plug and a level bar fills. */
export function ChargingStationIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChargingStationIconProps) {
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
      <g transform="translate(0.6 0)">
      <path d="M4.5 21V5.5A2.5 2.5 0 0 1 7 3H11.5A2.5 2.5 0 0 1 14 5.5V21M3 21H15.5" />
      <motion.path
        d="M10.4 6.2 7.8 11H10.7L8.6 15"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.25, 1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed }}
      />
      <path d="M7.4 18H11.1" strokeWidth={strokeWidth * 0.6} opacity={0.3} />
      <motion.path
        d="M7.4 18H11.1"
        stroke={accent}
        strokeWidth={strokeWidth * 0.6}
        initial={false}
        animate={on ? { pathLength: [0, 0, 1] } : { pathLength: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.3, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M14 11.5H17.5A1 1 0 0 1 18.5 12.5V15"
        initial={false}
        animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.5 / speed, ease: "easeOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { y: [-2, 0], opacity: [0, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.35 : 0) / speed, ease: "easeOut" }}
      >
        <rect x="16.2" y="15" width="4.6" height="4" rx="1.2" fill="currentColor" stroke="none" />
        <path d="M17.7 19V21.5M19.3 19V21.5" stroke={accent} strokeWidth={strokeWidth * 0.5} />
      </motion.g>
      </g>
    </svg>
  );
}
