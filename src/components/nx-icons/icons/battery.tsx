"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BatteryIconProps = {
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

/** A battery whose bars fill one by one, as if charging. */
export function BatteryIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BatteryIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
      <path d="M4.5 8h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" />
      <path d="M21.5 10.8v2.4" />
      {[5.7, 9.5, 13.3].map((x, i) => (
        <motion.rect
          key={x}
          x={x}
          y="10"
          width="2.6"
          height="4"
          rx="0.6"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { opacity: [0.14, 0.14, 1, 1] } : { opacity: i < 2 ? 1 : 0.14 }}
          transition={on ? { duration: 1.6 / speed, times: [0, 0.2 + i * 0.22, 0.22 + i * 0.22, 1], ease: "linear" } : { duration: 0.2 / speed }}
        />
      ))}
    </svg>
  );
}
