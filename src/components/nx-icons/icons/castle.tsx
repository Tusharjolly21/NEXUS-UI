"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CastleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A castle whose flag flutters in the wind while the portcullis lifts and drops back. */
export function CastleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CastleIconProps) {
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
        d="M12 3.7L14.9 4.4L17.8 5.1L12 6.5Z"
        fill={accent}
        stroke={accent}
        strokeWidth={strokeWidth * 0.5}
        initial={false}
        animate={on ? { d: ["M12 3.7L14.9 4.4L17.8 5.1L12 6.5Z", "M12 3.7L14.9 3.7L17.8 6L12 6.5Z", "M12 3.7L14.9 5L17.8 4.3L12 6.5Z", "M12 3.7L14.9 3.9L17.8 5.8L12 6.5Z", "M12 3.7L14.9 4.8L17.8 4.6L12 6.5Z", "M12 3.7L14.9 4.4L17.8 5.1L12 6.5Z"] } : { d: "M12 3.7L14.9 4.4L17.8 5.1L12 6.5Z" }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M11.21 15.31V21.2"
        strokeWidth={strokeWidth * 0.375}
        initial={false}
        animate={on ? { d: ["M11.21 15.31V21.2", "M11.21 15.31V15.36", "M11.21 15.31V15.36", "M11.21 15.31V21.2"] } : { d: "M11.21 15.31V21.2" }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.62, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M12.79 15.31V21.2"
        strokeWidth={strokeWidth * 0.375}
        initial={false}
        animate={on ? { d: ["M12.79 15.31V21.2", "M12.79 15.31V15.36", "M12.79 15.31V15.36", "M12.79 15.31V21.2"] } : { d: "M12.79 15.31V21.2" }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.62, 1], ease: "easeInOut" }}
      />
      <path d="M3 21.2V8.7H6.6V12.2H10.2V8.7H13.8V12.2H17.4V8.7H21V21.2Z" />
      <path d="M9 21.2V18.2a3 3 0 0 1 6 0V21.2" />
      <path d="M12 8.7V2.8" />
    </svg>
  );
}
