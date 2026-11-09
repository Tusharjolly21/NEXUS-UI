"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UsbIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A USB stick that drops out of its port, slides back in with a firm push and blinks its light. */
export function UsbIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UsbIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { y: [0, 7.5, -0.7, 0] } : { y: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.22, 0.7, 1], ease: ["easeIn", "easeOut", "easeInOut"] }}
        >
          <rect x="6" y="9.5" width="12" height="12" rx="2.5" />
          <path d="M8 9.5v-7h8v7" />
          <rect x="9.93" y="4.43" width="1.6" height="1.6" fill="currentColor" stroke="none" />
          <rect x="12.47" y="4.43" width="1.6" height="1.6" fill="currentColor" stroke="none" />
          <motion.path
            d="M12 15.5h.01"
            stroke={accent}
            strokeWidth={3}
            initial={false}
            animate={on ? { opacity: [1, 0, 0, 1, 0.15, 1] } : { opacity: 1 }}
            transition={{ duration: 0.9 / speed, times: [0, 0.1, 0.68, 0.74, 0.86, 1] }}
          />
        </motion.g>
      </svg>
    </svg>
  );
}
