"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SlidersIconProps = {
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

/** Three sliders whose knobs slide to new settings and settle. */
export function SlidersIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SlidersIconProps) {
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
      {[
        { y: 7, x: 9, to: 5 },
        { y: 12, x: 15, to: -5 },
        { y: 17, x: 8, to: 4 },
      ].map((k, i) => (
        <g key={k.y}>
          <path d={`M3.5 ${k.y}h17`} opacity="0.35" />
          <motion.circle
            cx={k.x}
            cy={k.y}
            r="2.2"
            fill={accent}
            initial={false}
            animate={on ? { x: [0, k.to, -k.to * 0.5, 0] } : { x: 0 }}
            transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut", delay: (i * 0.05) / speed }}
          />
        </g>
      ))}
    </svg>
  );
}
