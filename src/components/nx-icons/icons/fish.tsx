"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FishIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #32ade6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A fish that swims a small wave with a lashing tail while bubbles rise from its mouth. */
export function FishIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FishIconProps) {
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
        animate={on ? { y: [0, -1.1, 0, 1.1, 0], rotate: [0, -4, 0, 4, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.81 10.5C10.01 7.8 13.61 6 17.01 6.9C19.41 7.6 21.21 9.8 21.21 12C21.21 14.2 19.41 16.4 17.01 17.1C13.61 18 10.01 16.2 7.81 13.5" />
        <path d="M14.41 6.71Q11.81 12 14.41 17.29" stroke={accent} />
        <circle cx="17.61" cy="10.2" r="1" fill="currentColor" stroke="none" />
        <motion.g
          style={{ originX: "32.5%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, 14, -14, 14, -8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M7.81 13.5L2.81 16.8Q4.81 12 2.81 7.2L7.81 10.5" stroke={accent} />
        </motion.g>
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        {([[20.61, 7, 0.1], [18.81, 4.8, 0.3], [21.21, 3.6, 0.5]] as [number, number, number][]).map(([x, y, d]) => (
          <motion.circle
            key={d}
            cx={x}
            cy={y}
            r="0.9"
            strokeWidth={1.4}
            stroke={accent}
            initial={false}
            animate={on ? { y: [0, -3.4], opacity: [0, 1, 0], scale: [0.4, 1, 1] } : { y: 0, opacity: 0, scale: 1 }}
            transition={{ duration: 0.6 / speed, delay: (on ? d : 0) / speed, ease: "easeOut" }}
          />
        ))}
      </svg>
    </svg>
  );
}
