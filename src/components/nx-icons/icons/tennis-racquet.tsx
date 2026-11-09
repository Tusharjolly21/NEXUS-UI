"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TennisRacquetIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A tennis racquet that winds back, swings through and sends the ball flying off the corner before it pops back. */
export function TennisRacquetIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TennisRacquetIconProps) {
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
        style={{ originX: "70%", originY: "79.17%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 21, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.22, 0.46, 0.9], ease: ["easeOut", "easeIn", "easeInOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M16.8 19L14.95 16.64" strokeWidth={strokeWidth * 1.8} />
        <path d="M14.95 16.64L13.54 14.82" />
        <motion.g
          style={{ originX: "43.06%", originY: "44.69%" }}
          initial={false}
          animate={on ? { scale: [1, 1, 1.07, 0.97, 1] } : { scale: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.38, 0.43, 0.52, 0.66] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <ellipse cx="10.34" cy="10.73" rx="5.2" ry="4.3" transform="rotate(232 10.34 10.73)" />
          <path d="M5.46 9.23H15.21M5.46 12.23H15.21M8.84 6.61V14.84M11.84 6.61V14.84" strokeWidth={strokeWidth * 0.75} transform="rotate(232 10.34 10.73)" />
        </motion.g>
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.circle
          cx="17.19"
          cy="5.37"
          r="2.2"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { x: [0, 0, 11.82, 11.82, 0, 0, 0], y: [0, 0, -9.23, -9.23, 0, 0, 0], scale: [1, 1, 0.7, 0.7, 0, 1.18, 1] } : { x: 0, y: 0, scale: 1 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.345, 0.636, 0.727, 0.728, 0.864, 1] }}
        />
      </svg>
    </svg>
  );
}
