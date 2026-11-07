"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ToothIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5ac8fa. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The tooth gives a small shine pulse while a sparkle glints and fades beside its crown. */
export function ToothIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ToothIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.07, 1, 1.04, 1], rotate: [0, -3, 2, 0, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 6.2C11 4.4 9.2 3.6 7.6 3.9C5.2 4.4 4.2 6.6 4.7 9C5.1 10.8 6.4 12.4 6.9 14.4C7.3 16.4 7.1 17.6 7.4 19.2C7.7 20.8 9.6 21 10 19.5C10.5 17.4 10.8 15.2 12 15.2C13.2 15.2 13.5 17.4 14 19.5C14.4 21 16.3 20.8 16.6 19.2C16.9 17.6 16.7 16.4 17.1 14.4C17.6 12.4 18.9 10.8 19.3 9C19.8 6.6 18.8 4.4 16.4 3.9C14.8 3.6 13 4.4 12 6.2z" />
        <path d="M7.4 7.2C6.9 8 6.8 8.9 7.1 9.9" stroke={accent} strokeWidth={1.6} />
      </motion.g>
      <motion.path
        d="M20.2 1.6Q20.2 3.8 22.4 3.8Q20.2 3.8 20.2 6Q20.2 3.8 18 3.8Q20.2 3.8 20.2 1.6z"
        fill={accent}
        stroke="none"
        style={{ originX: "84.17%", originY: "15.83%" }}
        initial={false}
        animate={on ? { scale: [0, 1.2, 0.9, 0], rotate: [0, 45, 90, 135], opacity: [0, 1, 1, 0] } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.6 / speed, delay: (0.2) / speed, ease: "easeOut" }}
      />
      </svg>
    </svg>
  );
}
