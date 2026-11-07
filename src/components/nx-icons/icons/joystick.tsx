"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type JoystickIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A joystick that tilts left and right while its two buttons press in turn. */
export function JoystickIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: JoystickIconProps) {
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
      <rect x="3" y="14.5" width="18" height="6.5" rx="2" />
      <motion.circle
        cx="7.2"
        cy="17.75"
        r="1.3"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 0.5, 1, 1] } : { scale: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.3, 0.4, 1] }}
      />
      <motion.circle
        cx="16.8"
        cy="17.75"
        r="1.3"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 0.5, 1, 1] } : { scale: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.5, 0.6, 0.7, 1] }}
      />
      <motion.g
        style={{ originX: "50%", originY: "60.42%" }}
        initial={false}
        animate={on ? { rotate: [0, -20, 0, 20, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 14.5V10" />
        <circle cx="12" cy="6.5" r="3.5" fill={accent} />
      </motion.g>
    </svg>
  );
}
