"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BaseballIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A baseball that winds back, then spins fast as it is thrown, with speed lines trailing behind it. */
export function BaseballIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BaseballIconProps) {
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
      <motion.path
        d="M1.9 9.6H3.8M1.9 12H3.8M1.9 14.4H3.8"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { opacity: [0, 0, 0.55, 0.55, 0] } : { opacity: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.47, 0.55, 0.7, 0.85] }}
      />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { x: [0, -1.7, 1.9, 0], rotate: [0, -30, 390, 360] } : { x: 0, rotate: 360 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.28, 0.6, 1], ease: ["easeInOut", "easeIn", "easeOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="12" r="8.2" />
        <path d="M5.91 6.51A5.81 5.81 0 0 1 5.91 17.49M8.28 8.08L6.81 9.43M9.63 10.58L7.69 11.07M9.63 13.42L7.69 12.93M8.28 15.92L6.81 14.57M18.09 6.51A5.81 5.81 0 0 0 18.09 17.49M15.72 8.08L17.19 9.43M14.37 10.58L16.31 11.07M14.37 13.42L16.31 12.93M15.72 15.92L17.19 14.57" stroke={accent} strokeWidth={strokeWidth * 0.75} />
      </motion.g>
    </svg>
  );
}
