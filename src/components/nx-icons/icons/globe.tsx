"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GlobeIconProps = {
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

/** A globe whose meridians sweep round as it turns. */
export function GlobeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GlobeIconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M4.4 7.6h15.2M4.4 16.4h15.2M3 12h18" strokeWidth={strokeWidth * 0.6} opacity="0.55" />
      <motion.ellipse
        cx="12"
        cy="12"
        rx="4"
        ry="9"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.15, 1, 0.15, 1] } : { scaleX: 1 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
