"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SurfboardIconProps = {
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

/** A surfboard that carves forward and back on the face of a rippling wave. */
export function SurfboardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SurfboardIconProps) {
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
<g transform="translate(-1.08 -0.48)">
      <motion.g
        style={{ originX: "46.67%", originY: "48.33%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 6, -3, 0], x: [0, 0.94, -0.35, 0, 0], y: [0, -1.29, 0.49, 0, 0] } : { rotate: 0, x: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut", times: [0, 0.3, 0.55, 0.8, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M16.67 4.08C17.71 8.42 15.57 12.55 12.56 16.54C10.36 19.39 7.68 20.53 5.73 19.12C3.79 17.71 4.05 14.81 6.08 11.84C8.94 7.73 12.21 4.42 16.67 4.08Z" />
        <path d="M16.67 4.08L5.73 19.12" strokeLinecap="butt" />
      </motion.g>
      <motion.path
        d="M13.4 20.2q1.4-1.3 2.8 0t2.8 0t2.8 0"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M13.4 20.2q1.4-1.3 2.8 0t2.8 0t2.8 0", "M13.4 20.2q1.4 1.3 2.8 0t2.8 0t2.8 0", "M13.4 20.2q1.4-1.3 2.8 0t2.8 0t2.8 0", "M13.4 20.2q1.4 1.3 2.8 0t2.8 0t2.8 0", "M13.4 20.2q1.4-1.3 2.8 0t2.8 0t2.8 0"] } : { d: "M13.4 20.2q1.4-1.3 2.8 0t2.8 0t2.8 0" }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
</g>
    </svg>
  );
}
