"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AlienIconProps = {
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

/** An alien whose head tilts while its eyes blink with a glint and its two antennae bob. */
export function AlienIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AlienIconProps) {
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
        style={{ originX: "50%", originY: "86%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 6, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.g
          style={{ originX: "36.4%", originY: "26.63%" }}
          initial={false}
          animate={on ? { rotate: [0, -14, 10, -6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut", delay: (0) / speed }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M8.74 6.39L6.84 2.99" />
          <circle cx="6.84" cy="2.99" r="1" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          style={{ originX: "63.6%", originY: "26.63%" }}
          initial={false}
          animate={on ? { rotate: [0, 14, -10, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut", delay: (0.1) / speed }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M15.26 6.39L17.16 2.99" />
          <circle cx="17.16" cy="2.99" r="1" fill={accent} stroke="none" />
        </motion.g>
        <path d="M12 21C8 21 4 15.5 4 11.2C4 8 7.5 6 12 6C16.5 6 20 8 20 11.2C20 15.5 16 21 12 21Z" />
        {([[8.3, 25], [15.7, -25]] as [number, number][]).map(([x, r]) => (
          <g key={x} transform={`rotate(${r} ${x} 12.4)`}>
            <motion.ellipse
              cx={x}
              cy="12.4"
              rx="2.7"
              ry="1.5"
              fill="currentColor"
              stroke="none"
              style={{ originX: "50%", originY: "50%" }}
              initial={false}
              animate={on ? { scaleY: [1, 1, 0.1, 1, 1] } : { scaleY: 1 }}
              transition={{ duration: 1 / speed, times: [0, 0.4, 0.5, 0.6, 1] }}
            />
            <motion.circle
              cx={x - 0.9}
              cy="12"
              r="0.55"
              fill={accent}
              stroke="none"
              style={{ originX: "50%", originY: "50%" }}
              initial={false}
              animate={on ? { scale: [1, 1, 0, 2, 1, 1] } : { scale: 1 }}
              transition={{ duration: 1 / speed, times: [0, 0.4, 0.5, 0.65, 0.8, 1] }}
            />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}
