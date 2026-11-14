"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DogIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The dog tilts its head left and right while its accent ears flop outwards in turn and its tongue pants out and in. */
export function DogIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DogIconProps) {
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
      <g transform="translate(0 0)">
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, -9, 9, -5, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.55, 0.8, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <motion.path
            d="M8.5 6.4C7.64 6.1 6.5 5.55 5.7 5.7C4.9 5.85 4.17 6.48 3.7 7.3C3.23 8.12 3 9.45 2.9 10.6C2.8 11.75 2.88 13.22 3.1 14.2C3.32 15.18 3.78 16.2 4.2 16.5C4.62 16.8 5.32 16.34 5.6 16C5.88 15.66 5.48 15.21 5.88 14.47A6.6 6.6 0 0 1 8.5 6.4Z"
            stroke={accent}
            fill={accent}
            initial={false}
            animate={on ? { d: ["M8.5 6.4C7.64 6.1 6.5 5.55 5.7 5.7C4.9 5.85 4.17 6.48 3.7 7.3C3.23 8.12 3 9.45 2.9 10.6C2.8 11.75 2.88 13.22 3.1 14.2C3.32 15.18 3.78 16.2 4.2 16.5C4.62 16.8 5.32 16.34 5.6 16C5.88 15.66 5.48 15.21 5.88 14.47A6.6 6.6 0 0 1 8.5 6.4Z", "M8.5 6.4C7.64 6.1 5.96 5.83 5.12 6.1C4.27 6.38 3.76 7.16 3.46 8.05C3.15 8.94 3.18 10.3 3.3 11.45C3.42 12.59 3.78 14.02 4.18 14.94C4.59 15.87 5.24 16.77 5.7 16.99C6.17 17.2 6.95 16.65 6.98 16.23C7.01 15.81 5.48 15.21 5.88 14.47A6.6 6.6 0 0 1 8.5 6.4Z", "M8.5 6.4C7.64 6.1 6.5 5.55 5.7 5.7C4.9 5.85 4.17 6.48 3.7 7.3C3.23 8.12 3 9.45 2.9 10.6C2.8 11.75 2.88 13.22 3.1 14.2C3.32 15.18 3.78 16.2 4.2 16.5C4.62 16.8 5.32 16.34 5.6 16C5.88 15.66 5.48 15.21 5.88 14.47A6.6 6.6 0 0 1 8.5 6.4Z", "M8.5 6.4C7.64 6.1 6.5 5.55 5.7 5.7C4.9 5.85 4.17 6.48 3.7 7.3C3.23 8.12 3 9.45 2.9 10.6C2.8 11.75 2.88 13.22 3.1 14.2C3.32 15.18 3.78 16.2 4.2 16.5C4.62 16.8 5.32 16.34 5.6 16C5.88 15.66 5.48 15.21 5.88 14.47A6.6 6.6 0 0 1 8.5 6.4Z"] } : { d: "M8.5 6.4C7.64 6.1 6.5 5.55 5.7 5.7C4.9 5.85 4.17 6.48 3.7 7.3C3.23 8.12 3 9.45 2.9 10.6C2.8 11.75 2.88 13.22 3.1 14.2C3.32 15.18 3.78 16.2 4.2 16.5C4.62 16.8 5.32 16.34 5.6 16C5.88 15.66 5.48 15.21 5.88 14.47A6.6 6.6 0 0 1 8.5 6.4Z" }}
            transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
          />
          <motion.path
            d="M15.5 6.4C16.36 6.1 17.5 5.55 18.3 5.7C19.1 5.85 19.83 6.48 20.3 7.3C20.77 8.12 21 9.45 21.1 10.6C21.2 11.75 21.12 13.22 20.9 14.2C20.68 15.18 20.22 16.2 19.8 16.5C19.38 16.8 18.68 16.34 18.4 16C18.12 15.66 18.52 15.21 18.12 14.47A6.6 6.6 0 0 0 15.5 6.4Z"
            stroke={accent}
            fill={accent}
            initial={false}
            animate={on ? { d: ["M15.5 6.4C16.36 6.1 17.5 5.55 18.3 5.7C19.1 5.85 19.83 6.48 20.3 7.3C20.77 8.12 21 9.45 21.1 10.6C21.2 11.75 21.12 13.22 20.9 14.2C20.68 15.18 20.22 16.2 19.8 16.5C19.38 16.8 18.68 16.34 18.4 16C18.12 15.66 18.52 15.21 18.12 14.47A6.6 6.6 0 0 0 15.5 6.4Z", "M15.5 6.4C16.36 6.1 17.5 5.55 18.3 5.7C19.1 5.85 19.83 6.48 20.3 7.3C20.77 8.12 21 9.45 21.1 10.6C21.2 11.75 21.12 13.22 20.9 14.2C20.68 15.18 20.22 16.2 19.8 16.5C19.38 16.8 18.68 16.34 18.4 16C18.12 15.66 18.52 15.21 18.12 14.47A6.6 6.6 0 0 0 15.5 6.4Z", "M15.5 6.4C16.36 6.1 16.91 5.38 17.65 5.42C18.39 5.45 19.3 5.89 19.92 6.61C20.53 7.32 21.02 8.58 21.33 9.69C21.65 10.8 21.85 12.26 21.82 13.27C21.8 14.27 21.53 15.36 21.18 15.73C20.83 16.11 20.22 15.72 19.71 15.51C19.2 15.3 18.52 15.21 18.12 14.47A6.6 6.6 0 0 0 15.5 6.4Z", "M15.5 6.4C16.36 6.1 17.5 5.55 18.3 5.7C19.1 5.85 19.83 6.48 20.3 7.3C20.77 8.12 21 9.45 21.1 10.6C21.2 11.75 21.12 13.22 20.9 14.2C20.68 15.18 20.22 16.2 19.8 16.5C19.38 16.8 18.68 16.34 18.4 16C18.12 15.66 18.52 15.21 18.12 14.47A6.6 6.6 0 0 0 15.5 6.4Z"] } : { d: "M15.5 6.4C16.36 6.1 17.5 5.55 18.3 5.7C19.1 5.85 19.83 6.48 20.3 7.3C20.77 8.12 21 9.45 21.1 10.6C21.2 11.75 21.12 13.22 20.9 14.2C20.68 15.18 20.22 16.2 19.8 16.5C19.38 16.8 18.68 16.34 18.4 16C18.12 15.66 18.52 15.21 18.12 14.47A6.6 6.6 0 0 0 15.5 6.4Z" }}
            transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
          />
          <motion.path
            d="M10.5 13.5L10.5 14A1.5 1.5 0 0 0 13.5 14L13.5 13.5"
            strokeWidth={strokeWidth * 0.75}
            fill="currentColor"
            fillOpacity={0.2}
            initial={false}
            animate={on ? { d: ["M10.5 13.5L10.5 14A1.5 1.5 0 0 0 13.5 14L13.5 13.5", "M10.5 13.5L10.5 14.7A1.5 1.5 0 0 0 13.5 14.7L13.5 13.5", "M10.5 13.5L10.5 13.5A1.5 1.5 0 0 0 13.5 13.5L13.5 13.5", "M10.5 13.5L10.5 14.7A1.5 1.5 0 0 0 13.5 14.7L13.5 13.5", "M10.5 13.5L10.5 14A1.5 1.5 0 0 0 13.5 14L13.5 13.5"] } : { d: "M10.5 13.5L10.5 14A1.5 1.5 0 0 0 13.5 14L13.5 13.5" }}
            transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
          />
          <path d="M5.4 12A6.6 6.6 0 1 1 18.6 12A6.6 6.6 0 1 1 5.4 12Z" />
          <ellipse cx="9.5" cy="9.0" rx="1" ry="1.15" fill="currentColor" stroke="none" />
          <ellipse cx="14.5" cy="9.0" rx="1" ry="1.15" fill="currentColor" stroke="none" />
          <ellipse cx="12" cy="11.2" rx="1.6" ry="1.1" fill="currentColor" stroke="none" />
          <path d="M12 12.2L12 13M12 13A2.5 2.5 0 0 1 8.33 12.25M12 13A2.5 2.5 0 0 0 15.67 12.25" strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </g>
    </svg>
  );
}
