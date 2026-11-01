"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PercentIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A percent sign that draws its slash and pops its two circles in, like a sale tag going up. */
export function PercentIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PercentIconProps) {
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
        animate={on ? { rotate: [-10, 0] } : { rotate: 0 }}
        transition={{ duration: 0.5 / speed, ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M18 6 6 18"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.3 / speed }}
        />
        {[8.2, 15.8].map((p, i) => (
          <motion.circle
            key={p}
            cx={p}
            cy={p}
            r="2.4"
            stroke={accent}
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [0, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 / speed, delay: (0.25 + i * 0.15) / speed }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
