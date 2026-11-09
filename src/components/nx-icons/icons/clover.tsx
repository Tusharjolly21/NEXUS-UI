"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CloverIconProps = {
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

/** A four leaf clover whose leaves flutter in turn while its stem sways. */
export function CloverIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CloverIconProps) {
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
        style={{ originX: "50%", originY: "39.71%" }}
        initial={false}
        animate={on ? { rotate: [0, 3, -2.5, 1.5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 15.4C12 18.1 12.9 20.2 15.8 21.03" />
      </motion.g>
      {([-45, 45, 135, 225] as number[]).map((a, i) => (
        <g key={a} transform={`rotate(${a} 12 9.53)`}>
          <motion.g
            style={{ originX: "50%", originY: "39.71%" }}
            initial={false}
            animate={on ? { scaleX: [1, 0.68, 1.07, 0.92, 1], rotate: [0, -3, 2, -1, 0] } : { scaleX: 1, rotate: 0 }}
            transition={{ duration: 0.55 / speed, delay: (on ? i * 0.14 : 0) / speed, ease: "easeInOut" }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <path d="M12 9.53L8.88 6.41A2.15 2.15 0 1 1 12 3.45A2.15 2.15 0 1 1 15.12 6.41Z" stroke={accent} />
          </motion.g>
        </g>
      ))}
    </svg>
  );
}
