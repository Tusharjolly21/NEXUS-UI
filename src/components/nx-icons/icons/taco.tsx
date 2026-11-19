"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TacoIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #34c759. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A taco hops up and lands with a little squash while the lettuce peeking out of its shell flutters. */
export function TacoIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TacoIconProps) {
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
      <g transform="translate(0 -1.63)">

      <motion.g
        style={{ originX: "50%", originY: "81.67%" }}
        initial={false}
        animate={on ? { y: [0, -2.2, 0, 0, 0], scaleY: [1, 1.03, 0.9, 1.03, 1] } : { y: 0, scaleY: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.55, 0.75, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { d: ["M5.76 9.02A1.58 1.58 0 0 1 8.88 9.02A1.58 1.58 0 0 1 12 9.02A1.58 1.58 0 0 1 15.12 9.02A1.58 1.58 0 0 1 18.24 9.02A1.8 1.8 0 0 1 17.6 10.4A5.6 5.6 0 0 1 6.4 10.4A1.8 1.8 0 0 1 5.76 9.02Z", "M5.76 9.02A1.56 1.56 0 0 1 8.88 9.02A1.63 1.63 0 0 1 12 9.02A1.56 1.56 0 0 1 15.12 9.02A1.63 1.63 0 0 1 18.24 9.02A1.8 1.8 0 0 1 17.6 10.4A5.6 5.6 0 0 1 6.4 10.4A1.8 1.8 0 0 1 5.76 9.02Z", "M5.76 9.02A1.63 1.63 0 0 1 8.88 9.02A1.56 1.56 0 0 1 12 9.02A1.63 1.63 0 0 1 15.12 9.02A1.56 1.56 0 0 1 18.24 9.02A1.8 1.8 0 0 1 17.6 10.4A5.6 5.6 0 0 1 6.4 10.4A1.8 1.8 0 0 1 5.76 9.02Z", "M5.76 9.02A1.56 1.56 0 0 1 8.88 9.02A1.63 1.63 0 0 1 12 9.02A1.56 1.56 0 0 1 15.12 9.02A1.63 1.63 0 0 1 18.24 9.02A1.8 1.8 0 0 1 17.6 10.4A5.6 5.6 0 0 1 6.4 10.4A1.8 1.8 0 0 1 5.76 9.02Z", "M5.76 9.02A1.58 1.58 0 0 1 8.88 9.02A1.58 1.58 0 0 1 12 9.02A1.58 1.58 0 0 1 15.12 9.02A1.58 1.58 0 0 1 18.24 9.02A1.8 1.8 0 0 1 17.6 10.4A5.6 5.6 0 0 1 6.4 10.4A1.8 1.8 0 0 1 5.76 9.02Z"] } : { d: "M5.76 9.02A1.58 1.58 0 0 1 8.88 9.02A1.58 1.58 0 0 1 12 9.02A1.58 1.58 0 0 1 15.12 9.02A1.58 1.58 0 0 1 18.24 9.02A1.8 1.8 0 0 1 17.6 10.4A5.6 5.6 0 0 1 6.4 10.4A1.8 1.8 0 0 1 5.76 9.02Z" }}
          transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.55, 0.75, 1], ease: "easeInOut" }}
        />
        <motion.path
          initial={false}
          animate={on ? { d: ["M5.76 9.02A1.58 1.58 0 0 1 8.88 9.02A1.58 1.58 0 0 1 12 9.02A1.58 1.58 0 0 1 15.12 9.02A1.58 1.58 0 0 1 18.24 9.02", "M5.76 9.02A1.56 1.56 0 0 1 8.88 9.02A1.63 1.63 0 0 1 12 9.02A1.56 1.56 0 0 1 15.12 9.02A1.63 1.63 0 0 1 18.24 9.02", "M5.76 9.02A1.63 1.63 0 0 1 8.88 9.02A1.56 1.56 0 0 1 12 9.02A1.63 1.63 0 0 1 15.12 9.02A1.56 1.56 0 0 1 18.24 9.02", "M5.76 9.02A1.56 1.56 0 0 1 8.88 9.02A1.63 1.63 0 0 1 12 9.02A1.56 1.56 0 0 1 15.12 9.02A1.63 1.63 0 0 1 18.24 9.02", "M5.76 9.02A1.58 1.58 0 0 1 8.88 9.02A1.58 1.58 0 0 1 12 9.02A1.58 1.58 0 0 1 15.12 9.02A1.58 1.58 0 0 1 18.24 9.02"] } : { d: "M5.76 9.02A1.58 1.58 0 0 1 8.88 9.02A1.58 1.58 0 0 1 12 9.02A1.58 1.58 0 0 1 15.12 9.02A1.58 1.58 0 0 1 18.24 9.02" }}
          transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.55, 0.75, 1], ease: "easeInOut" }}
        />
        <path d="M2.8 10.4A9.2 9.2 0 0 0 21.2 10.4A1.8 1.8 0 0 0 17.6 10.4A5.6 5.6 0 0 1 6.4 10.4A1.8 1.8 0 0 0 2.8 10.4Z" />
      </motion.g>

      </g>
    </svg>
  );
}
