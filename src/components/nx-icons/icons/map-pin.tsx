"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MapPinIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A map pin that drops from above, lands with a ripple and bounces once. */
export function MapPinIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MapPinIconProps) {
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
      <motion.ellipse
        cx="12"
        cy="21"
        rx="2"
        ry="0.8"
        stroke={accent}
        initial={false}
        animate={on ? { scaleX: [1, 3.2], opacity: [0.9, 0] } : { scaleX: 1, opacity: 0.3 }}
        transition={on ? { duration: 0.5 / speed, delay: (0.3) / speed, ease: "easeOut" } : { duration: 0.15 / speed }}
      />
      <motion.g
        initial={false}
        animate={on ? { y: [-9, 0, -2.2, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.34, 0.55, 0.75], ease: ["easeIn", "easeOut", "easeIn"] }}
      >
        <path d="M12 20.8s6.2-5.1 6.2-10.6a6.2 6.2 0 0 0-12.4 0c0 5.5 6.2 10.6 6.2 10.6z" />
        <circle cx="12" cy="10.2" r="2.3" fill={accent} stroke="none" />
      </motion.g>
    </svg>
  );
}
