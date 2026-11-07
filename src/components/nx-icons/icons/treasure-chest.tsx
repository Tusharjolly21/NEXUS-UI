"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TreasureChestIconProps = {
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

/** A treasure chest whose lid swings open as gold sparkles rise out, then it closes again. */
export function TreasureChestIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TreasureChestIconProps) {
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
      <path d="M3 10.5V19.5h18V10.5" />
      <path d="M7.2 10.5V19.5M16.8 10.5V19.5" />
      <motion.path
        d="M5 10.5H19"
        stroke={accent}
        strokeWidth={1.6}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.2, 0.35, 0.75, 1] }}
      />
      <motion.g
        style={{ originX: "12.5%", originY: "43.75%" }}
        initial={false}
        animate={on ? { rotate: [0, -17, -17, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.25, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3 10.5A9 6 0 0 1 21 10.5Z" />
        <path d="M7.2 10.5V5.42M16.8 10.5V5.42" />
      </motion.g>
      <path d="M10.4 9.3h3.2v4.6h-3.2z" fill="currentColor" stroke="currentColor" strokeWidth={1} />
      <path d="M12 11.2v1.4" stroke={accent} strokeWidth={1.2} />
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        {([[9.5, 0], [13, 0.12], [16.2, 0.24]] as [number, number][]).map(([x, d]) => (
          <motion.path
            key={x}
            d={`M${x} 9.3v2M${x - 1} 10.3h2`}
            stroke={accent}
            strokeWidth={1.3}
            initial={false}
            animate={on ? { y: [0, -2, -5.5, -8], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
            transition={{ duration: 0.6 / speed, delay: (0.3 + d) / speed, ease: "easeOut" }}
          />
        ))}
      </svg>
    </svg>
  );
}
