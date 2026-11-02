"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MoreVerticalIconProps = {
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

/** Three stacked dots that hop sideways in a rolling wave from top to bottom, the middle one in colour and swelling as it goes. */
export function MoreVerticalIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MoreVerticalIconProps) {
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
      {[5, 12, 19].map((y, i) => (
        <motion.circle
          key={y}
          cx="12"
          cy={y}
          r="1.5"
          fill={i === 1 ? accent : "currentColor"}
          stroke={i === 1 ? accent : "currentColor"}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { x: [0, 5, 0], scale: i === 1 ? [1, 1.35, 1] : [1, 1.1, 1] } : { x: 0, scale: 1 }}
          transition={{ duration: 0.45 / speed, delay: (i * 0.1) / speed, times: [0, 0.45, 1], ease: ["easeOut", "easeInOut"] }}
        />
      ))}
    </svg>
  );
}
