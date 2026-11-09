"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ScanViewfinderIconProps = {
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

/** Four corner brackets tighten in around a centre dot while a scan line sweeps down and back up through the frame. */
export function ScanViewfinderIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ScanViewfinderIconProps) {
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
      {([
        ["M3.5 9V4.7a1.2 1.2 0 0 1 1.2-1.2H9", 1, 1],
        ["M15 3.5h4.3a1.2 1.2 0 0 1 1.2 1.2V9", -1, 1],
        ["M20.5 15v4.3a1.2 1.2 0 0 1-1.2 1.2H15", -1, -1],
        ["M9 20.5H4.7a1.2 1.2 0 0 1-1.2-1.2V15", 1, -1],
      ] as [string, number, number][]).map(([d, sx, sy]) => (
        <motion.path
          key={d}
          d={d}
          initial={false}
          animate={on ? { x: [0, sx * 1.4, sx * 1.4, 0], y: [0, sy * 1.4, sy * 1.4, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
        />
      ))}
      <motion.circle
        cx="12"
        cy="12"
        r="1.5"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 1.7, 1, 1, 1.7, 1, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.26, 0.33, 0.4, 0.65, 0.72, 0.79, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M6.5 12h11"
        stroke={accent}
        initial={false}
        animate={on ? { y: [-5.5, 5.5, -5.5], opacity: [0, 1, 1, 1, 0] } : { y: 0, opacity: 0 }}
        transition={{
          y: { duration: 0.7 / speed, delay: (0.12) / speed, times: [0, 0.5, 1], ease: "easeInOut" },
          opacity: { duration: 0.7 / speed, delay: (0.12) / speed, times: [0, 0.1, 0.5, 0.9, 1] },
        }}
      />
    </svg>
  );
}
