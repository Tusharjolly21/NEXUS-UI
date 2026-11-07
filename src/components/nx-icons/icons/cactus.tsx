"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CactusIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A potted cactus that sways in the heat while a small flower pops open on top. */
export function CactusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CactusIconProps) {
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
      <path d="M6.6 17L17.4 17L16.4 21L7.6 21Z" />
      <motion.g
        style={{ originX: "50%", originY: "70.8%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 5, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.6 17L9.6 14.6L6 14.6A1.6 1.6 0 0 1 4.4 13L4.4 9.6A1.6 1.6 0 0 1 7.6 9.6L7.6 11.4L9.6 11.4L9.6 5.4A2.4 2.4 0 0 1 14.4 5.4L14.4 8.2L16.4 8.2L16.4 6.6A1.6 1.6 0 0 1 19.6 6.6L19.6 9.8A1.6 1.6 0 0 1 18 11.4L14.4 11.4L14.4 17" />
        <motion.g
          style={{ originX: "50.0%", originY: "11.7%" }}
          initial={false}
          animate={on ? { scale: [0, 1.4, 1, 1, 0], rotate: [-70, 0, 0, 0, 0] } : { scale: 0, rotate: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.45, 0.75, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          {([[12, 1.45], [13.28, 2.38], [12.79, 3.89], [11.21, 3.89], [10.72, 2.38]] as [number, number][]).map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="1.05" fill={accent} stroke="none" />
          ))}
          <circle cx="12" cy="2.8" r="0.8" fill="currentColor" stroke="none" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
