"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CampfireIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A campfire whose flame flickers while sparks rise from it. */
export function CampfireIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CampfireIconProps) {
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
      <path d="M4.6 16.88L19.4 21.28M19.4 16.88L4.6 21.28" />
      <motion.g
        style={{ originX: "50%", originY: "70.3%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.08, 0.94, 1.06, 0.97, 1], skewX: [0, -4, 3, -3, 2, 0] } : { scaleY: 1, skewX: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 2.68C12.4 5.68 17.4 7.88 17.4 11.68A5.4 5.4 0 0 1 6.6 11.68C6.6 8.88 9 7.68 10.2 5.08C10.7 4.08 11.3 3.48 12 2.68Z" />
        <motion.g
          style={{ originX: "50%", originY: "70.3%" }}
          initial={false}
          animate={on ? { scale: [1, 0.82, 1.12, 0.86, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 9.68C12.2 10.88 14 11.68 14 12.88A2 2 0 0 1 10 12.88C10 11.68 11.8 10.88 12 9.68Z" fill={accent} stroke={accent} strokeWidth={1.2} />
        </motion.g>
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        {([[5.6, 9.68, 0.05, -1], [18.6, 8.68, 0.2, 1], [14.8, 4.08, 0.35, -1]] as [number, number, number, number][]).map(([x, y, d, s]) => (
          <motion.path
            key={d}
            d={`M${x} ${y}h.01`}
            stroke={accent}
            strokeWidth={2}
            initial={false}
            animate={on ? { y: [0, -5.5], x: [0, s * 1.2, 0], opacity: [0, 1, 0] } : { y: 0, x: 0, opacity: 0 }}
            transition={{ duration: 0.7 / speed, delay: (on ? d : 0) / speed, ease: "easeOut" }}
          />
        ))}
      </svg>
    </svg>
  );
}
