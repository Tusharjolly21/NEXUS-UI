"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type XRayIconProps = {
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

/** A glowing scan line sweeps down the film and back while the ribcage flickers into view. */
export function XRayIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: XRayIconProps) {
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
        initial={false}
        animate={on ? { y: [0, 12.4, 0], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
        transition={{ y: { duration: 0.9 / speed, times: [0, 0.5, 1], ease: "easeInOut" }, opacity: { duration: 0.9 / speed, times: [0, 0.08, 0.92, 1] } }}
      >
        <path d="M3.8 5.8H20.2" stroke={accent} />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { opacity: [1, 0.35, 1, 0.35, 1] } : { opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.45, 0.7, 1], ease: "easeInOut" }}
      >
        <path d="M12 5.6V18.4" />
        <path d="M6.54 9.51A10.6 10.6 0 0 1 17.46 9.51M6.72 13.13A7.6 7.6 0 0 1 17.28 13.13M7.68 17.03A4.6 4.6 0 0 1 16.32 17.03" />
      </motion.g>
      <path d="M3.8 5.4A2.2 2.2 0 0 1 6 3.2L18 3.2A2.2 2.2 0 0 1 20.2 5.4L20.2 18.6A2.2 2.2 0 0 1 18 20.8L6 20.8A2.2 2.2 0 0 1 3.8 18.6Z" />
    </svg>
  );
}
