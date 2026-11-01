"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FlowerIconProps = {
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

/** A flower whose petals spin open round a pulsing centre. */
export function FlowerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FlowerIconProps) {
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
      <path d="M12 16.4V21.6" />
      <path d="M12 20.4c0-1.7 1.4-2.6 3.6-2.6 0 1.8-1.4 2.6-3.6 2.6z" stroke={accent} />
      <motion.g
        style={{ originX: "50%", originY: "46%" }}
        initial={false}
        animate={on ? { rotate: [0, 72] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="12" cy="5.8" rx="1.5" ry="3" transform={`rotate(${a} 12 10.4)`} />
        ))}
      </motion.g>
      <motion.circle
        cx="12"
        cy="10.4"
        r="1.7"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.5, 1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.8 / speed }}
      />
    </svg>
  );
}
