"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CheckboxIconProps = {
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

/** An empty box that squashes, tints with colour and draws a tick inside it. */
export function CheckboxIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CheckboxIconProps) {
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
        animate={on ? { scale: [1, 0.9, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 / speed, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <rect x="4" y="4" width="16" height="16" rx="4.2" />
        <motion.rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="4.2"
          stroke={accent}
          fill={accent}
          fillOpacity={0.16}
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={{ duration: 0.25 / speed }}
        />
        <motion.path
          d="M8 12l3 3 5-6"
          stroke={accent}
          initial={false}
          animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
          transition={{
            pathLength: { duration: 0.3 / speed, delay: (on ? 0.16 : 0) / speed, ease: "easeOut" },
            opacity: { duration: 0.02 / speed, delay: (on ? 0.16 : 0.28) / speed },
          }}
        />
      </motion.g>
    </svg>
  );
}
