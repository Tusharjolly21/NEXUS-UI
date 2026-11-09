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

/** A TV remote whose power button presses in, then its signal arcs pulse outward twice. */
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
      <rect x="7.8" y="7.4" width="8.4" height="14.1" rx="2.4" />
      <motion.path
        d="M12 10.48h0.01"
        stroke={accent}
        strokeWidth={2.6}
        style={{ originX: "50%", originY: "43.67%" }}
        initial={false}
        animate={on ? { scale: [1, 0.65, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 / speed, delay: (0.05) / speed }}
      />
      <circle cx="12" cy="14.91" r="1.7" strokeWidth={strokeWidth * 0.65} />
      <path d="M10.1 18.89h0.01M13.9 18.89h0.01" strokeWidth={strokeWidth * 0.85} />
      <motion.path
        d="M10.46 4.94A2.3 2.3 0 0 1 13.54 4.94"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        style={{ originX: "50%", originY: "27.71%" }}
        initial={false}
        animate={on ? { opacity: [1, 1, 0, 1, 1, 0, 1, 1], scale: [1, 1, 0.55, 1, 1, 0.55, 1, 1] } : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.3, 0.33, 0.52, 0.75, 0.78, 0.97, 1] }}
      />
      <motion.path
        d="M9.06 3.38A4.4 4.4 0 0 1 14.94 3.38"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        style={{ originX: "50%", originY: "27.71%" }}
        initial={false}
        animate={on ? { opacity: [1, 1, 0, 1, 1, 0, 1, 1], scale: [1, 1, 0.55, 1, 1, 0.55, 1, 1] } : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 / speed, times: [0, 0.42, 0.45, 0.64, 0.87, 0.9, 1.09, 1] }}
      />
    </svg>
  );
}
