"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TabletIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #00c7be. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A tablet that tips over into landscape, lights its screen with a few lines of content, and tips back upright. */
export function TabletIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TabletIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -90, -90, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.72, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="5" y="2.5" width="14" height="19" rx="2.6" />
        <path d="M10.6 18.4h2.8" stroke={accent} />
        <motion.rect
          x="7.3"
          y="4.8"
          width="9.4"
          height="11.4"
          rx="1"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0, 0.26, 0.26, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.25, 0.4, 0.7, 0.95], ease: "easeInOut" }}
        />
        <motion.path
          d="M9.6 8.4h4.8M9.6 11.4h3"
          stroke={accent}
          strokeWidth={1.6}
          initial={false}
          animate={on ? { pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.5, 0.72, 0.9], ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
