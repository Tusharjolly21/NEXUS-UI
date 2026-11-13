"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CamperVanIconProps = {
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

/** A camper van that bounces down the road while its wheels turn. */
export function CamperVanIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CamperVanIconProps) {
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
<g transform="translate(0 -0.75)">
      <motion.g
        initial={false}
        animate={on ? { y: [0, -0.7, 0.2, -0.5, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <path d="M2.5 12.3H21.5" stroke={accent} />
        <path d="M5 17.5A2.5 2.5 0 0 1 2.5 15V8A2.5 2.5 0 0 1 5 5.5H16.2L21.5 10.4V15A2.5 2.5 0 0 1 19 17.5M10 17.5H14" />
        <rect x="4.9" y="7.6" width="4" height="2.6" rx="0.6" fill="currentColor" stroke="none" />
        <rect x="10.3" y="7.6" width="3.8" height="2.6" rx="0.6" fill="currentColor" stroke="none" />
      </motion.g>

        <motion.g
          style={{ originX: "31.25%", originY: "72.92%" }}
          initial={false}
          animate={on ? { rotate: [0, 360] } : { rotate: 0, transition: { duration: 0 / speed } }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="7.5" cy="17.5" r="2.5" />
          <path d="M5 17.5 H10" strokeWidth={strokeWidth * 0.6} />
        </motion.g>

        <motion.g
          style={{ originX: "68.75%", originY: "72.92%" }}
          initial={false}
          animate={on ? { rotate: [0, 360] } : { rotate: 0, transition: { duration: 0 / speed } }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="16.5" cy="17.5" r="2.5" />
          <path d="M14 17.5 H19" strokeWidth={strokeWidth * 0.6} />
        </motion.g>
</g>
    </svg>
  );
}
