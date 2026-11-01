"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CrownIconProps = {
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

/** A crown that is lowered into place and settles, its three jewels twinkling one by one. */
export function CrownIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CrownIconProps) {
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
        initial={false}
        animate={on ? { y: [-3.5, 0.5, 0] } : { y: 0 }}
        transition={{ duration: 0.45 / speed, ease: "easeOut" }}
      >
        {[
          { x: 3.5, y: 6.6, d: 0.4 },
          { x: 12, y: 3.8, d: 0.5 },
          { x: 20.5, y: 6.6, d: 0.6 },
        ].map((j) => (
          <motion.circle
            key={j.x}
            cx={j.x}
            cy={j.y}
            r="1.3"
            fill={accent}
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [1, 1.8, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 / speed, delay: (j.d) / speed }}
          />
        ))}
        <path d="M3.5 18.5V8.2l4.6 4.3L12 5.3l3.9 7.2 4.6-4.3v10.3z" />
        <path d="M3.5 21h17" />
      </motion.g>
    </svg>
  );
}
