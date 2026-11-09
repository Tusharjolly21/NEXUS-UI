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
      <path d="M2.5 21V10.5M6 21V10.5M2.5 12.5H6" />
      <path d="M18 21V10.5M21.5 21V10.5M18 12.5H21.5" />
      <path d="M9 21V8.5M15 21V3.2M9 10.5H15" />
      <path d="M6 15H9M15 15H18" />
      <path d="M2.5 21H21.5" />
      <svg x="9" y="16" width="6" height="5" viewBox="9 16 6 5" overflow="hidden">
        <motion.path
          d="M12 16.5V20M10.5 18.3H13.5"
          strokeWidth={strokeWidth * 0.75}
          strokeLinecap="butt"
          initial={false}
          animate={on ? { y: [0, -4.2, -4.2, 0] } : { y: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.4, 0.62, 1], ease: "easeInOut" }}
        />
      </svg>
      <path d="M9 21V18a3 3 0 0 1 6 0V21" />
      <motion.path
        d="M15 3.2 L17.6 4.1 L20.2 5 L15 6.8Z"
        fill={accent}
        stroke={accent}
        strokeWidth={strokeWidth * 0.5}
        initial={false}
        animate={on ? { d: ["M15 3.2 L17.6 4.1 L20.2 5 L15 6.8Z", "M15 3.2 L17.6 3.5 L20.2 5.8 L15 6.8Z", "M15 3.2 L17.6 4.8 L20.2 4.2 L15 6.8Z", "M15 3.2 L17.6 3.7 L20.2 5.7 L15 6.8Z", "M15 3.2 L17.6 4.4 L20.2 4.5 L15 6.8Z", "M15 3.2 L17.6 4.1 L20.2 5 L15 6.8Z"] } : { d: "M15 3.2 L17.6 4.1 L20.2 5 L15 6.8Z" }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
