"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PenguinIconProps = {
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

/** A penguin that waddles: its body tilts from foot to foot while the flippers swing against it. */
export function PenguinIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PenguinIconProps) {
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
        style={{ originX: "50%", originY: "85.29%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 0, 7, 0, -7, 0, 7, 0], y: [0, -0.4, 0, -0.4, 0, -0.4, 0, -0.4, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M11.57 21.57A2.3 1.1 10 0 1 7.03 20.77A2.3 1.1 10 0 1 11.57 21.57Z" fill="currentColor" stroke="none" /><path d="M16.97 20.77A2.3 1.1 -10 0 1 12.43 21.57A2.3 1.1 -10 0 1 16.97 20.77Z" fill="currentColor" stroke="none" />
        <motion.g
          style={{ originX: "22.83%", originY: "51.68%" }}
          initial={false}
          animate={on ? { rotate: [0, 12, 0, -6, 0, 12, 0, -6, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M5.66 14.77A1.3 3.8 17 1 1 5.3 10.04Z" fill="currentColor" />
        </motion.g>
        <motion.g
          style={{ originX: "77.17%", originY: "51.68%" }}
          initial={false}
          animate={on ? { rotate: [0, -12, 0, 6, 0, -12, 0, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M18.7 10.04A1.3 3.8 -17 1 1 18.34 14.77Z" fill="currentColor" />
        </motion.g>
        <path d="M18.8 11.57A6.8 8.9 0 0 1 5.2 11.57A6.8 8.9 0 0 1 18.8 11.57Z" />
        <path d="M16.7 14.37A4.7 4.4 0 0 1 7.3 14.37A4.7 4.4 0 0 1 16.7 14.37Z" stroke="none" fill={accent} fillOpacity={0.3} />
        <circle cx="9.5" cy="6.37" r="1" fill="currentColor" stroke="none" /><circle cx="14.5" cy="6.37" r="1" fill="currentColor" stroke="none" />
        <path d="M11 7.97L13 7.97L12 9.47Z" fill="currentColor" strokeWidth={1} />
      </motion.g>
    </svg>
  );
}
