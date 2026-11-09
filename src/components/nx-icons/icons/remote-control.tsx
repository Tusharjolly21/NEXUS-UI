"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RemoteControlIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A TV remote whose buttons press in turn before its infrared rays fire twice. */
export function RemoteControlIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RemoteControlIconProps) {
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
      <g transform="translate(0 -0.12)">
      <rect x="7.5" y="8" width="9" height="13.5" rx="2.5" />
      <path d="M12 6.4h.01" stroke={accent} strokeWidth={2.4} />
      <motion.path
        d="M9.79 4.85L8.81 4.16"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [1, 1, 0, 1, 0, 1], opacity: [1, 1, 0, 1, 0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.49, 0.5, 0.7, 0.71, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M12 3.7L12 2.5"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [1, 1, 0, 1, 0, 1], opacity: [1, 1, 0, 1, 0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.49, 0.5, 0.7, 0.71, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M14.21 4.85L15.19 4.16"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [1, 1, 0, 1, 0, 1], opacity: [1, 1, 0, 1, 0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.49, 0.5, 0.7, 0.71, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="12"
        cy="13.65"
        r="2.3"
        strokeWidth={strokeWidth * 0.75}
        style={{ originX: "50%", originY: "56.9%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 0.8, 1, 1] } : { scale: 1 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.38, 0.46, 0.58, 1] }}
      />
      <motion.path
        d="M10.2 18.6h.01"
        strokeWidth={2.2}
        style={{ originX: "42.5%", originY: "77.5%" }}
        initial={false}
        animate={on ? { scale: [1, 0.5, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 / speed, delay: (on ? 0.05 : 0) / speed }}
      />
      <motion.path
        d="M13.8 18.6h.01"
        strokeWidth={2.2}
        style={{ originX: "57.5%", originY: "77.5%" }}
        initial={false}
        animate={on ? { scale: [1, 0.5, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 / speed, delay: (on ? 0.22 : 0) / speed }}
      />
      </g>
    </svg>
  );
}
