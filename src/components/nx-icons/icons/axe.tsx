"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AxeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An axe that is raised, chops down hard and throws off a wood chip. */
export function AxeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AxeIconProps) {
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
        style={{ originX: "39.15%", originY: "75.29%" }}
        initial={false}
        animate={on ? { rotate: [0, 12, -26, -20, 0], y: [0, -0.5, 0.8, 0.4, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.5, 0.64, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g transform="translate(0.08 2.09) rotate(34 12 12)">
          <path d="M12 10.5 V20.6" />
          <path d="M5.2 3 C6.6 4 8 4.9 9.8 4.9 H13.6 A1.4 1.4 0 0 1 15 6.3 V9.1 A1.4 1.4 0 0 1 13.6 10.5 H9.8 C8 10.5 6.6 11.4 5.2 12.6" />
          <path d="M5.2 3 C2.6 5.8 2.6 9.8 5.2 12.6" stroke={accent} />
        </g>
      </motion.g>
      <motion.path
        d="M2.7 11.94 l1.6 1.2 l-2.2 .9z"
        fill={accent}
        stroke={accent}
        strokeWidth={0.8}
        initial={false}
        animate={on ? { x: [0, -0.7, -1.3], y: [0, -1.5, 2.6], rotate: [0, 120, 260], opacity: [0, 1, 1, 0] } : { x: 0, y: 0, rotate: 0, opacity: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.45 / speed, delay: (0.43) / speed, ease: "easeOut" }}
      />
    </svg>
  );
}
