"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CropIconProps = {
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

/** Two crop handles slide outward, then pinch in past the mark and snap into place while the cropped area flashes. */
export function CropIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CropIconProps) {
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
      <motion.rect
        x="7"
        y="7"
        width="10"
        height="10"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.48, 0.68, 1], fillOpacity: [0, 0.14, 0.32, 0] } : { scale: 1, fillOpacity: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.3, 0.62, 1], ease: ["easeOut", "easeIn", "easeOut"] }}
      />
      <motion.path
        d="M7 3v14h14"
        initial={false}
        animate={on ? { x: [0, -2.4, 1.6, 0], y: [0, 2.4, -1.6, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.3, 0.62, 1], ease: ["easeOut", "easeIn", "easeOut"] }}
      />
      <motion.path
        d="M3 7h14v14"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, 2.4, -1.6, 0], y: [0, -2.4, 1.6, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.3, 0.62, 1], ease: ["easeOut", "easeIn", "easeOut"] }}
      />
    </svg>
  );
}
