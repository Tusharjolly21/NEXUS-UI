"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DiscoBallIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A disco ball whose mirror grid rocks round as tiles glint in turn and light rays flash. */
export function DiscoBallIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DiscoBallIconProps) {
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
      <path d="M12 2.5V5.5" />
      <circle cx="12" cy="13.5" r="8" />
      <g strokeWidth={1}>
        <path d="M5.6 8.7H18.4M4 13.5H20M5.6 18.3H18.4" />
        <motion.path
          d="M12 5.5C9.16 5.5 6.86 9.08 6.86 13.5 C6.86 17.92 9.16 21.5 12 21.5"
          initial={false}
          animate={on ? { d: ["M12 5.5C9.16 5.5 6.86 9.08 6.86 13.5 C6.86 17.92 9.16 21.5 12 21.5", "M12 5.5C9.83 5.5 8.08 9.08 8.08 13.5 C8.08 17.92 9.83 21.5 12 21.5", "M12 5.5C10.33 5.5 8.97 9.08 8.97 13.5 C8.97 17.92 10.33 21.5 12 21.5", "M12 5.5C10.47 5.5 9.24 9.08 9.24 13.5 C9.24 17.92 10.47 21.5 12 21.5", "M12 5.5C10.24 5.5 8.81 9.08 8.81 13.5 C8.81 17.92 10.24 21.5 12 21.5", "M12 5.5C9.74 5.5 7.9 9.08 7.9 13.5 C7.9 17.92 9.74 21.5 12 21.5", "M12 5.5C9.16 5.5 6.86 9.08 6.86 13.5 C6.86 17.92 9.16 21.5 12 21.5", "M12 5.5C8.69 5.5 6.01 9.08 6.01 13.5 C6.01 17.92 8.69 21.5 12 21.5", "M12 5.5C8.43 5.5 5.53 9.08 5.53 13.5 C5.53 17.92 8.43 21.5 12 21.5", "M12 5.5C8.36 5.5 5.41 9.08 5.41 13.5 C5.41 17.92 8.36 21.5 12 21.5", "M12 5.5C8.49 5.5 5.64 9.08 5.64 13.5 C5.64 17.92 8.49 21.5 12 21.5", "M12 5.5C8.77 5.5 6.15 9.08 6.15 13.5 C6.15 17.92 8.77 21.5 12 21.5", "M12 5.5C9.16 5.5 6.86 9.08 6.86 13.5 C6.86 17.92 9.16 21.5 12 21.5"] } : { d: "M12 5.5C9.16 5.5 6.86 9.08 6.86 13.5 C6.86 17.92 9.16 21.5 12 21.5" }}
          transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
        />
        <motion.path
          d="M12 5.5C12 5.5 12 9.08 12 13.5 C12 17.92 12 21.5 12 21.5"
          initial={false}
          animate={on ? { d: ["M12 5.5C12 5.5 12 9.08 12 13.5 C12 17.92 12 21.5 12 21.5", "M12 5.5C12.82 5.5 13.48 9.08 13.48 13.5 C13.48 17.92 12.82 21.5 12 21.5", "M12 5.5C13.35 5.5 14.44 9.08 14.44 13.5 C14.44 17.92 13.35 21.5 12 21.5", "M12 5.5C13.5 5.5 14.71 9.08 14.71 13.5 C14.71 17.92 13.5 21.5 12 21.5", "M12 5.5C13.26 5.5 14.27 9.08 14.27 13.5 C14.27 17.92 13.26 21.5 12 21.5", "M12 5.5C12.7 5.5 13.27 9.08 13.27 13.5 C13.27 17.92 12.7 21.5 12 21.5", "M12 5.5C12 5.5 12 9.08 12 13.5 C12 17.92 12 21.5 12 21.5", "M12 5.5C11.35 5.5 10.83 9.08 10.83 13.5 C10.83 17.92 11.35 21.5 12 21.5", "M12 5.5C10.93 5.5 10.07 9.08 10.07 13.5 C10.07 17.92 10.93 21.5 12 21.5", "M12 5.5C10.83 5.5 9.88 9.08 9.88 13.5 C9.88 17.92 10.83 21.5 12 21.5", "M12 5.5C11.03 5.5 10.24 9.08 10.24 13.5 C10.24 17.92 11.03 21.5 12 21.5", "M12 5.5C11.46 5.5 11.03 9.08 11.03 13.5 C11.03 17.92 11.46 21.5 12 21.5", "M12 5.5C12 5.5 12 9.08 12 13.5 C12 17.92 12 21.5 12 21.5"] } : { d: "M12 5.5C12 5.5 12 9.08 12 13.5 C12 17.92 12 21.5 12 21.5" }}
          transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
        />
        <motion.path
          d="M12 5.5C14.84 5.5 17.14 9.08 17.14 13.5 C17.14 17.92 14.84 21.5 12 21.5"
          initial={false}
          animate={on ? { d: ["M12 5.5C14.84 5.5 17.14 9.08 17.14 13.5 C17.14 17.92 14.84 21.5 12 21.5", "M12 5.5C15.42 5.5 18.18 9.08 18.18 13.5 C18.18 17.92 15.42 21.5 12 21.5", "M12 5.5C15.74 5.5 18.77 9.08 18.77 13.5 C18.77 17.92 15.74 21.5 12 21.5", "M12 5.5C15.82 5.5 18.91 9.08 18.91 13.5 C18.91 17.92 15.82 21.5 12 21.5", "M12 5.5C15.68 5.5 18.67 9.08 18.67 13.5 C18.67 17.92 15.68 21.5 12 21.5", "M12 5.5C15.34 5.5 18.05 9.08 18.05 13.5 C18.05 17.92 15.34 21.5 12 21.5", "M12 5.5C14.84 5.5 17.14 9.08 17.14 13.5 C17.14 17.92 14.84 21.5 12 21.5", "M12 5.5C14.31 5.5 16.19 9.08 16.19 13.5 C16.19 17.92 14.31 21.5 12 21.5", "M12 5.5C13.94 5.5 15.51 9.08 15.51 13.5 C15.51 17.92 13.94 21.5 12 21.5", "M12 5.5C13.84 5.5 15.33 9.08 15.33 13.5 C15.33 17.92 13.84 21.5 12 21.5", "M12 5.5C14.03 5.5 15.67 9.08 15.67 13.5 C15.67 17.92 14.03 21.5 12 21.5", "M12 5.5C14.41 5.5 16.36 9.08 16.36 13.5 C16.36 17.92 14.41 21.5 12 21.5", "M12 5.5C14.84 5.5 17.14 9.08 17.14 13.5 C17.14 17.92 14.84 21.5 12 21.5"] } : { d: "M12 5.5C14.84 5.5 17.14 9.08 17.14 13.5 C17.14 17.92 14.84 21.5 12 21.5" }}
          transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
        />
      </g>
      {([
          [9.43, 11.1, 0.2],
          [14.57, 15.9, 0.45],
          [9.43, 15.9, 0.7],
          [14.57, 11.1, 0.95],
      ] as [number, number, number][]).map(([x, y, d]) => (
        <motion.circle
          key={d}
          cx={x}
          cy={y}
          r="0.7"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 2.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 / speed, delay: (d) / speed }}
        />
      ))}
      {([
          ["M4.49 7.2L2.96 5.92", 0.1, 1],
          ["M7.86 4.62L7.01 2.81", 0.3, 0],
          ["M16.14 4.62L16.99 2.81", 0.5, 0],
          ["M19.51 7.2L21.04 5.92", 0.7, 1],
      ] as [string, number, number][]).map(([p, d, r]) => (
        <motion.path
          key={p}
          d={p}
          stroke={accent}
          strokeWidth={1.6}
          initial={false}
          animate={on ? (r ? { pathLength: [1, 0, 1, 1], opacity: 1 } : { pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }) : { pathLength: r, opacity: r }}
          transition={{ duration: 0.5 / speed, delay: (d) / speed }}
        />
      ))}
    </svg>
  );
}
