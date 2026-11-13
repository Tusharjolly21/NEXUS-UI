"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RibbonIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff2d92. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An awareness ribbon whose loop swells while its two tails flutter apart and swing back together. */
export function RibbonIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RibbonIconProps) {
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
      <g transform="translate(0 0.17)">
      <motion.g style={{ originX: "50%", originY: "56.67%" }} initial={false} animate={on ? { rotate: [0, -10, 6, 0] } : { rotate: 0 }} transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.65, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M12 13.6C9.58 16.27 6.4 17.8 5.8 20.8" stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "56.67%" }} initial={false} animate={on ? { rotate: [0, 10, -6, 0] } : { rotate: 0 }} transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.65, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M12 13.6C14.42 16.27 17.6 17.8 18.2 20.8" stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "56.67%" }} initial={false} animate={on ? { scale: [1, 1.08, 0.98, 1] } : { scale: 1 }} transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.65, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M12 13.6L15.18 10.09A4.3 4.3 0 1 0 8.82 10.09L12 13.6"  />
      </motion.g>
      </g>
    </svg>
  );
}
