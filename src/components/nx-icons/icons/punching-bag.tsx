"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PunchingBagIconProps = {
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

/** A punch knocks the heavy bag swinging on its chain, and it rocks to a stop. */
export function PunchingBagIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PunchingBagIconProps) {
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
        style={{ originX: "50%", originY: "10.83%" }}
        initial={false}
        animate={on ? { rotate: [0, -11, 7, -3.5, 1.2, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.18, 0.45, 0.68, 0.86, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.8 13.3H16.2V16.9H7.8Z" fill={accent} stroke="none" />
        <path d="M12 2.6L12 4.6M10.2 8.8L12 4.6L13.8 8.8" />
        <path d="M7.8 11A2.2 2.2 0 0 1 10 8.8L14 8.8A2.2 2.2 0 0 1 16.2 11L16.2 19.2A2.2 2.2 0 0 1 14 21.4L10 21.4A2.2 2.2 0 0 1 7.8 19.2Z" />
        <path d="M7.8 13.3H16.2M7.8 16.9H16.2" />
      </motion.g>
    </svg>
  );
}
