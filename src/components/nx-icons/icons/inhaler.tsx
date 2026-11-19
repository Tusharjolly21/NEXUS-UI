"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type InhalerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The canister is pressed down into the holder and three dots of mist puff out of the mouthpiece before it springs back up. */
export function InhalerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: InhalerIconProps) {
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
      <g transform="translate(0.46 0.1)">

      <motion.path
        d="M12.4 8.6V4.6A1.6 1.6 0 0 1 15.6 4.6V8.6"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M12.4 8.6V4.6A1.6 1.6 0 0 1 15.6 4.6V8.6", "M12.4 8.6V6.4A1.6 1.6 0 0 1 15.6 6.4V8.6", "M12.4 8.6V6.4A1.6 1.6 0 0 1 15.6 6.4V8.6", "M12.4 8.6V4.6A1.6 1.6 0 0 1 15.6 4.6V8.6", "M12.4 8.6V4.6A1.6 1.6 0 0 1 15.6 4.6V8.6"] } : { d: "M12.4 8.6V4.6A1.6 1.6 0 0 1 15.6 4.6V8.6" }}
        transition={{ duration: 0.6 / speed, times: [0, 0.2, 0.45, 0.75, 1], ease: "easeInOut" }}
      />
      <path d="M10.95 9.35A0.8 0.8 0 0 1 11.75 8.6L16.25 8.6A0.8 0.8 0 0 1 17.05 9.35L17.66 18.67A2 2 0 0 1 15.66 20.8L11.48 20.8A1.2 1.2 0 0 1 10.28 19.52L10.28 19.54A0.6 0.6 0 0 0 9.68 18.9L6.6 18.9A1.2 1.2 0 0 1 5.4 17.7L5.4 16.4A1.2 1.2 0 0 1 6.6 15.2L9.07 15.2A1.6 1.6 0 0 0 10.67 13.7Z" />
      <path d="M8.2 15.2V18.9" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, -1.08, -1.8, 0], scale: [0, 1.15, 0.8, 0], opacity: [0, 1, 0, 0] } : { x: 0, scale: 0, opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.18) / speed, times: [0, 0.4, 0.9, 1], ease: "easeOut" }}
      >
        <circle cx="2.95" cy="15.85" r="0.75" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [0, -1.44, -2.4, 0], scale: [0, 1.15, 0.8, 0], opacity: [0, 1, 0, 0] } : { x: 0, scale: 0, opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.24) / speed, times: [0, 0.4, 0.9, 1], ease: "easeOut" }}
      >
        <circle cx="2.8" cy="17.05" r="0.9" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [0, -1.08, -1.8, 0], scale: [0, 1.15, 0.8, 0], opacity: [0, 1, 0, 0] } : { x: 0, scale: 0, opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.3) / speed, times: [0, 0.4, 0.9, 1], ease: "easeOut" }}
      >
        <circle cx="2.95" cy="18.25" r="0.75" fill={accent} stroke="none" />
      </motion.g>
      </g>
    </svg>
  );
}
