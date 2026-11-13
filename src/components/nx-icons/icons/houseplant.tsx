"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HouseplantIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #22c55e. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The leaves sway on their stem and each one grows a touch bigger in turn before settling back. */
export function HouseplantIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HouseplantIconProps) {
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
      <g transform="translate(0 -0.21)">

      <motion.g
        style={{ originX: "50%", originY: "60.83%" }}
        initial={false}
        animate={on ? { rotate: [0, -4, 3.5, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M12 10.6Q10.62 5.26 5.22 6.36Q6.59 11.7 12 10.6Z"
          stroke={accent}
          style={{ originX: "50%", originY: "44.17%" }}
          initial={false}
          animate={on ? { scale: [1, 1.14, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 / speed, delay: (0.1) / speed, ease: "easeInOut" }}
        />
        <motion.path
          d="M12 10.6Q17.41 11.7 18.78 6.36Q13.38 5.26 12 10.6Z"
          stroke={accent}
          style={{ originX: "50%", originY: "44.17%" }}
          initial={false}
          animate={on ? { scale: [1, 1.14, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 / speed, delay: (0.25) / speed, ease: "easeInOut" }}
        />
        <motion.path
          d="M12 10.6Q15.2 6.8 12 3Q8.8 6.8 12 10.6Z"
          stroke={accent}
          style={{ originX: "50%", originY: "44.17%" }}
          initial={false}
          animate={on ? { scale: [1, 1.14, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 / speed, delay: (0.4) / speed, ease: "easeInOut" }}
        />
        <path d="M12 14.6V10.6" />
      </motion.g>
      <path d="M6 14.6L18 14.6L16.69 20.17A1.6 1.6 0 0 1 15.13 21.4L8.87 21.4A1.6 1.6 0 0 1 7.31 20.17Z" />

      </g>
    </svg>
  );
}
