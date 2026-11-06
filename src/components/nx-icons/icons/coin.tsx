"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CoinIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A gold coin that flips over twice and lands with a sparkle at two of its corners. */
export function CoinIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CoinIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0.04, 1, 0.04, 1] } : { scaleX: 1 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="6.5" stroke={accent} strokeWidth={strokeWidth * 0.6} />
        <path d="M14.25 9.85C13.85 9.1 13 8.7 12 8.7C10.75 8.7 9.75 9.35 9.75 10.3C9.75 11.35 10.9 11.65 12 12C13.1 12.35 14.25 12.65 14.25 13.7C14.25 14.65 13.25 15.3 12 15.3C11 15.3 10.15 14.9 9.75 14.15M12 7.7V8.7M12 15.3V16.3" />
      </motion.g>
      {[
        { x: 21, y: 3, d: 0.8 },
        { x: 3, y: 21, d: 0.92 },
      ].map((s) => (
        <motion.path
          key={s.x}
          d={`M${s.x} ${s.y - 1.7}v3.4M${s.x - 1.7} ${s.y}h3.4`}
          stroke={accent}
          strokeWidth={1.5}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [0, 1.2, 0], rotate: [0, 0, 45], opacity: [0, 1, 0] } : { scale: 0, opacity: 0 }}
          transition={on ? { duration: 0.55 / speed, delay: (s.d) / speed } : { duration: 0.1 / speed }}
        />
      ))}
    </svg>
  );
}
