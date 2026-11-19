"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HurricaneIconProps = {
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

/** The storm spiral winds up and spins a full turn around its calm eye, tightening as it goes, then eases to a stop. */
export function HurricaneIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HurricaneIconProps) {
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
        animate={on ? { rotate: [0, -360], scale: [1, 0.88, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 1.1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M14.8 12C14.93 11.88 15.39 11.54 15.57 11.26C15.74 10.97 15.82 10.64 15.87 10.31C15.91 9.98 15.91 9.62 15.85 9.27C15.79 8.92 15.68 8.55 15.53 8.2C15.37 7.85 15.16 7.5 14.9 7.19C14.64 6.87 14.34 6.57 13.99 6.31C13.65 6.05 13.26 5.81 12.84 5.63C12.42 5.44 11.96 5.3 11.49 5.21C11.02 5.12 10.51 5.08 10.01 5.1C9.51 5.12 8.98 5.2 8.48 5.33C7.97 5.47 7.45 5.67 6.97 5.92C6.48 6.18 6 6.5 5.56 6.87C5.13 7.24 4.71 7.67 4.35 8.14C3.99 8.61 3.56 9.44 3.4 9.7M9.2 12C9.07 12.12 8.61 12.46 8.43 12.74C8.26 13.03 8.18 13.36 8.13 13.69C8.09 14.02 8.09 14.38 8.15 14.73C8.21 15.08 8.32 15.45 8.47 15.8C8.63 16.15 8.84 16.5 9.1 16.81C9.36 17.13 9.66 17.43 10.01 17.69C10.35 17.95 10.74 18.19 11.16 18.37C11.58 18.56 12.04 18.7 12.51 18.79C12.98 18.88 13.49 18.92 13.99 18.9C14.49 18.88 15.02 18.8 15.52 18.67C16.03 18.53 16.55 18.33 17.03 18.08C17.52 17.82 18 17.5 18.44 17.13C18.87 16.76 19.29 16.33 19.65 15.86C20.01 15.39 20.44 14.56 20.6 14.3" />
        <circle cx="12" cy="12" r="2.8" />
      </motion.g>
      <motion.circle
        cx="12"
        cy="12"
        r="1.1"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.6, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.4, 0.8, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
