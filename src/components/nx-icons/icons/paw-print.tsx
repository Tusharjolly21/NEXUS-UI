"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PawPrintIconProps = {
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

/** A paw print that presses down, its four toes pressing in one by one. */
export function PawPrintIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PawPrintIconProps) {
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
      <motion.path
        d="M12 12.2c-2.8 0-5 2.6-5 5 0 1.8 1.5 2.8 3 2.8.8 0 1.3-.3 2-.3s1.2.3 2 .3c1.5 0 3-1 3-2.8 0-2.4-2.2-5-5-5z"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0.88, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.3 / speed }}
      />
      {[
        { x: 5.4, y: 10.6, r: -22 },
        { x: 9.3, y: 6.2, r: -8 },
        { x: 14.7, y: 6.2, r: 8 },
        { x: 18.6, y: 10.6, r: 22 },
      ].map((t, i) => (
        <g key={t.x} transform={`rotate(${t.r} ${t.x} ${t.y})`}>
          <motion.ellipse
            cx={t.x}
            cy={t.y}
            rx="1.5"
            ry="2"
            fill={accent}
            stroke={accent}
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [1, 1.5, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 / speed, delay: (0.05 + i * 0.1) / speed }}
          />
        </g>
      ))}
    </svg>
  );
}
