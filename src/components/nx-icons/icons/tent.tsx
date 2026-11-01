"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TentIconProps = {
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

/** A tent whose door flaps swing open under twinkling stars. */
export function TentIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TentIconProps) {
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
        d="M12 12.5l-3.4 8"
        stroke={accent}
        style={{ originX: "100%", originY: "0%" }}
        initial={false}
        animate={on ? { rotate: [0, 18, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M12 12.5l3.4 8"
        stroke={accent}
        style={{ originX: "0%", originY: "0%" }}
        initial={false}
        animate={on ? { rotate: [0, -18, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
      <path d="M3 20.5 12 4l9 16.5z" />
      {["M5.2 6.2h.01", "M19.2 7.6h.01"].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke={accent}
          strokeWidth={2.6}
          initial={false}
          animate={on ? { opacity: [1, 0.15, 1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 0.8 / speed, delay: (on ? i * 0.15 : 0) / speed }}
        />
      ))}
    </svg>
  );
}
