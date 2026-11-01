"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type IceCreamIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6482. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A scoop on a cone that sways, with a cherry bouncing on top and the waffle drawing in. */
export function IceCreamIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: IceCreamIconProps) {
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
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 4, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.4 12.2 12 21.2l4.6-9" />
        <path d="M6.8 12.2V11a5.2 5.2 0 0 1 10.4 0v1.2z" />
        <motion.path
          d="M9.9 14.6l3 3.2M14.1 14.6l-3 3.2"
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.4 / speed, delay: (on ? 0.15 : 0) / speed }}
        />
        <motion.circle
          cx="12"
          cy="4.6"
          r="1.1"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { y: [0, -2, 0] } : { y: 0 }}
          transition={{ duration: 0.5 / speed, ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}
