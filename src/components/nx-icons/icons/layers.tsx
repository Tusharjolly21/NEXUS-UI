"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LayersIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Three stacked layers fan apart, the top one lifting and the bottom one dropping, then settle back into a neat stack with a soft glow on the top sheet. */
export function LayersIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LayersIconProps) {
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
        animate={on ? { scale: [1, 0.82, 0.82, 1] } : { scale: 1 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.34, 0.62, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M3.5 16.1 12 20.7l8.5-4.6"
          initial={false}
          animate={on ? { y: [0, 3, 3, -0.6, 0] } : { y: 0 }}
          transition={{ duration: 0.95 / speed, times: [0, 0.34, 0.62, 0.8, 1], ease: "easeInOut" }}
        />
        <path d="M3.5 11.9 12 16.5l8.5-4.6" stroke={accent} />
        <motion.path
          d="M12 3.1 20.5 7.7 12 12.3 3.5 7.7z"
          fill={accent}
          initial={false}
          animate={on ? { y: [0, -3, -3, 0.6, 0], fillOpacity: [0, 0, 0, 0.3, 0] } : { y: 0, fillOpacity: 0 }}
          transition={{ duration: 0.95 / speed, times: [0, 0.34, 0.62, 0.8, 1], ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
