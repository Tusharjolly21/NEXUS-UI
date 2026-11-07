"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LadderIconProps = {
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

/** The five rungs of a ladder light up one after another from the bottom to the top, as if someone were climbing. */
export function LadderIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LadderIconProps) {
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
      <path d="M8 3 5.5 21M16 3l2.5 18" />
      {([5.2, 8.6, 12, 15.4, 18.8]).map((y) => (
        <path key={y} d={`M${(8 - (2.5 * (y - 3)) / 18).toFixed(3)} ${y}H${(16 + (2.5 * (y - 3)) / 18).toFixed(3)}`} strokeWidth={1.75} />
      ))}
      {([18.8, 15.4, 12, 8.6, 5.2]).map((y, i) => (
        <motion.path
          key={y}
          d={`M${(8 - (2.5 * (y - 3)) / 18).toFixed(3)} ${y}H${(16 + (2.5 * (y - 3)) / 18).toFixed(3)}`}
          stroke={accent}
          strokeWidth={1.75}
          initial={false}
          animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.4 / speed, times: [0, 0.3, 0.55, 1], delay: (on ? i * 0.13 : 0) / speed }}
        />
      ))}
    </svg>
  );
}
