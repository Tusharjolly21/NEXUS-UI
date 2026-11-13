"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LanternIconProps = {
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

/** A camping lantern that sways on its ring handle while the flame flickers and the glass glows. */
export function LanternIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LanternIconProps) {
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
<g transform="translate(0 -0.04)">
      <motion.g
        style={{ originX: "50%", originY: "10.83%" }}
        initial={false}
        animate={on ? { rotate: [0, -6, 5, -2.5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M7.2 10.2H16.8V18.7H7.2Z"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0.3, 0.12, 0.34, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        />
        <motion.path
          d="M12 12C13.2 13.4 13.8 14.3 13.8 15A1.8 1.8 0 0 1 10.2 15C10.2 14.3 10.8 13.4 12 12Z"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { scale: [1, 1.22, 0.88, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        />
        <circle cx="12" cy="4.3" r="1.7" />
        <path d="M9 6H15L17.6 10.2H6.4Z" />
        <path d="M7.2 10.2V18.7H16.8V10.2" />
        <path d="M7 21.5H17" />
      </motion.g>
</g>
    </svg>
  );
}
