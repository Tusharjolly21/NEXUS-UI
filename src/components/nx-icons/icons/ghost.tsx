"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GhostIconProps = {
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

/** A ghost that floats up and down while its hem ripples and its eyes blink. */
export function GhostIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GhostIconProps) {
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
        initial={false}
        animate={on ? { y: [0, -1.3, 0, -1, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <motion.path
          d="M5 18 V10 A7 7 0 0 1 19 10 V18 C19 21.73 14.33 21.73 14.33 18 C14.33 21.73 9.67 21.73 9.67 18 C9.67 21.73 5 21.73 5 18Z"
          initial={false}
          animate={on ? { d: ["M5 18 V10 A7 7 0 0 1 19 10 V18 C19 21.73 14.33 21.73 14.33 18 C14.33 21.73 9.67 21.73 9.67 18 C9.67 21.73 5 21.73 5 18Z", "M5 18 V10 A7 7 0 0 1 19 10 V18 C19 22.67 14.33 22.67 14.33 18 C14.33 20.27 9.67 20.27 9.67 18 C9.67 22.67 5 22.67 5 18Z", "M5 18 V10 A7 7 0 0 1 19 10 V18 C19 20.27 14.33 20.27 14.33 18 C14.33 22.67 9.67 22.67 9.67 18 C9.67 20.27 5 20.27 5 18Z", "M5 18 V10 A7 7 0 0 1 19 10 V18 C19 22.67 14.33 22.67 14.33 18 C14.33 20.27 9.67 20.27 9.67 18 C9.67 22.67 5 22.67 5 18Z", "M5 18 V10 A7 7 0 0 1 19 10 V18 C19 20.27 14.33 20.27 14.33 18 C14.33 22.67 9.67 22.67 9.67 18 C9.67 20.27 5 20.27 5 18Z", "M5 18 V10 A7 7 0 0 1 19 10 V18 C19 21.73 14.33 21.73 14.33 18 C14.33 21.73 9.67 21.73 9.67 18 C9.67 21.73 5 21.73 5 18Z"] } : { d: "M5 18 V10 A7 7 0 0 1 19 10 V18 C19 21.73 14.33 21.73 14.33 18 C14.33 21.73 9.67 21.73 9.67 18 C9.67 21.73 5 21.73 5 18Z" }}
          transition={{ duration: 1 / speed, ease: "easeInOut" }}
        />
        {[9.2, 14.8].map((x) => (
          <motion.circle
            key={x}
            cx={x}
            cy="9.2"
            r="1.2"
            fill="currentColor"
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scaleY: [1, 1, 0.1, 1, 1, 0.1, 1] } : { scaleY: 1 }}
            transition={{ duration: 1 / speed, times: [0, 0.3, 0.38, 0.46, 0.7, 0.78, 0.88] }}
          />
        ))}
        <motion.ellipse
          cx="12"
          cy="13.4"
          rx="1.2"
          ry="1.6"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.3, 1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 1 / speed, ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
