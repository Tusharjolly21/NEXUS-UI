"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AirplayIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A screen with a triangle beneath it that dips, then lifts up into the screen while an echo of it ripples outward. */
export function AirplayIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AirplayIconProps) {
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
      <path d="M6 17.5a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 6 4.5h12A2.5 2.5 0 0 1 20.5 7v8a2.5 2.5 0 0 1-2.5 2.5" />
      <motion.path
        d="M12 15.2 16.2 20.4H7.8z"
        stroke={accent}
        style={{ originX: "50%", originY: "60%" }}
        initial={false}
        animate={on ? { scale: [1, 1.7], opacity: [0, 0.8, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.38 : 0) / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M12 15.2 16.2 20.4H7.8z"
        stroke={accent}
        style={{ originX: "50%", originY: "60%" }}
        initial={false}
        animate={on ? { y: [0, 1.4, -2.4, 0], scale: [1, 0.9, 1.12, 1] } : { y: 0, scale: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.25, 0.55, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
