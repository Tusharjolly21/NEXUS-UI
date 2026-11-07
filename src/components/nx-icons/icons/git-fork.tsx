"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GitForkIconProps = {
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

/** Both fork lines draw outward from the join and the new node on the right pops in. */
export function GitForkIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GitForkIconProps) {
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
      <motion.path
        d="M12 14.7C12 11.5 6 12.5 6 9.2V7"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45 / speed, times: [0, 0.1, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M12 14.7C12 11.5 18 12.5 18 9.2V7"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45 / speed, delay: (0.08) / speed, times: [0, 0.1, 1], ease: "easeOut" }}
      />
      <path d="M12 14.7V17" />
      <circle cx="12" cy="19" r="2" />
      <motion.circle
        cx="6"
        cy="5"
        r="2"
        style={{ originX: "25%", originY: "20.83%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, delay: (0.1) / speed, times: [0, 0.4, 0.65, 1] }}
      />
      <motion.circle
        cx="18"
        cy="5"
        r="2"
        stroke={accent}
        style={{ originX: "75%", originY: "20.83%" }}
        initial={false}
        animate={on ? { scale: [0, 0, 1.3, 0.92, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, delay: (0.1) / speed, times: [0, 0.4, 0.68, 0.85, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
