"use client";

import { motion, useReducedMotion } from "framer-motion";

export type MusicNotesIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** Three musical notes drift up from a rippling sound wave, sway and fade out one after another in a steady, seamless loop. */
export function MusicNotesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MusicNotesIconProps) {
  const reduce = useReducedMotion();
  const on = !reduce && (play ?? true);
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
      aria-hidden="true"
    >
      <motion.path
        d="M3 20.5 Q5.25 18.2 7.5 20.5 T12 20.5 T16.5 20.5 T21 20.5"
        stroke={accent}
        initial={false}
        animate={on ? { d: ["M3 20.5 Q5.25 18.2 7.5 20.5 T12 20.5 T16.5 20.5 T21 20.5", "M3 20.5 Q5.25 22.8 7.5 20.5 T12 20.5 T16.5 20.5 T21 20.5", "M3 20.5 Q5.25 18.2 7.5 20.5 T12 20.5 T16.5 20.5 T21 20.5"], opacity: [0.55, 0.85, 0.55] } : { d: "M3 20.5 Q5.25 18.2 7.5 20.5 T12 20.5 T16.5 20.5 T21 20.5", opacity: 0.55 }}
        transition={on ? { duration: 2.4 / speed, ease: "easeInOut", repeat: Infinity } : { duration: 0.35 / speed }}
      />
      <motion.g
        initial={false}
        animate={on ? { x: [3.4, 3.58, 3.76, 3.92, 4.07, 4.19, 4.29, 4.36, 4.4, 4.41, 4.39, 4.34, 4.27, 4.17, 4.06, 3.93, 3.8, 3.67, 3.54, 3.43, 3.33, 3.26, 3.21, 3.19, 3.2, 3.24, 3.31, 3.41, 3.53, 3.68, 3.84, 4.02, 3.4], y: [17.8, 17.78, 17.73, 17.65, 17.53, 17.39, 17.21, 17.01, 16.77, 16.52, 16.24, 15.95, 15.64, 15.32, 14.98, 14.64, 14.3, 13.96, 13.62, 13.28, 12.96, 12.65, 12.36, 12.08, 11.83, 11.59, 11.39, 11.21, 11.07, 10.95, 10.87, 10.82, 17.8], rotate: [3.39, 4.29, 5.03, 5.57, 5.9, 6, 5.87, 5.52, 4.95, 4.2, 3.28, 2.24, 1.11, -0.07, -1.23, -2.36, -3.39, -4.29, -5.03, -5.57, -5.9, -6, -5.87, -5.52, -4.95, -4.2, -3.28, -2.24, -1.11, 0.07, 1.23, 2.36, 3.39], scale: [0.76, 0.81, 0.84, 0.86, 0.88, 0.9, 0.92, 0.93, 0.95, 0.96, 0.97, 0.98, 0.99, 0.99, 1, 1, 1, 1, 1, 0.99, 0.99, 0.98, 0.97, 0.96, 0.95, 0.93, 0.92, 0.9, 0.88, 0.86, 0.84, 0.81, 0.76], opacity: [0, 0.03, 0.09, 0.16, 0.24, 0.32, 0.41, 0.51, 0.59, 0.68, 0.76, 0.83, 0.89, 0.94, 0.97, 0.99, 1, 0.99, 0.97, 0.94, 0.89, 0.83, 0.76, 0.68, 0.59, 0.51, 0.41, 0.32, 0.24, 0.16, 0.09, 0.03, 0] } : { x: 3.97, y: 14.74, rotate: -2.05, scale: 1, opacity: 1 }}
        transition={on ? { duration: 2.4 / speed, ease: "linear", repeat: Infinity } : { duration: 0.35 / speed, ease: "easeOut" }}
      >
        <ellipse cx="0" cy="0" rx="1.95" ry="1.5" transform="rotate(-24)" fill={"currentColor"} stroke="none" />
        <path d="M1.75 -0.6 V-8 C3.3 -7.4 4.8 -6.4 4.7 -3.7" stroke={"currentColor"} strokeWidth={strokeWidth * 0.68} />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [8.35, 8.29, 8.26, 8.26, 8.29, 8.35, 8.43, 8.55, 8.69, 8.84, 9.01, 9.18, 9.36, 9.53, 9.69, 9.83, 9.95, 10.05, 10.12, 10.16, 10.16, 10.14, 9.49, 9.41, 9.31, 9.2, 9.07, 8.93, 8.79, 8.66, 8.54, 8.43, 8.35], y: [16.1, 15.79, 15.46, 15.12, 14.77, 14.42, 14.06, 13.71, 13.37, 13.03, 12.71, 12.4, 12.11, 11.84, 11.59, 11.37, 11.18, 11.02, 10.89, 10.79, 10.73, 10.7, 17.89, 17.85, 17.78, 17.67, 17.53, 17.36, 17.16, 16.93, 16.67, 16.4, 16.1], rotate: [-6, -5.9, -5.58, -5.05, -4.32, -3.42, -2.4, -1.28, -0.11, 1.06, 2.2, 3.24, 4.17, 4.93, 5.5, 5.86, 6, 5.9, 5.58, 5.05, 4.32, 3.42, 2.4, 1.28, 0.11, -1.06, -2.2, -3.24, -4.17, -4.93, -5.5, -5.86, -6], scale: [0.98, 0.98, 0.99, 1, 1, 1, 1, 1, 0.99, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.92, 0.91, 0.89, 0.87, 0.85, 0.82, 0.78, 0.8, 0.83, 0.85, 0.88, 0.9, 0.91, 0.93, 0.94, 0.96, 0.97, 0.98], opacity: [0.81, 0.87, 0.92, 0.96, 0.99, 1, 1, 0.98, 0.95, 0.91, 0.85, 0.78, 0.71, 0.62, 0.54, 0.44, 0.35, 0.27, 0.18, 0.11, 0.05, 0.01, 0.02, 0.07, 0.13, 0.21, 0.29, 0.38, 0.47, 0.57, 0.65, 0.73, 0.81] } : { x: 8.43, y: 14.07, rotate: -2.42, scale: 1, opacity: 1 }}
        transition={on ? { duration: 2.4 / speed, ease: "linear", repeat: Infinity } : { duration: 0.35 / speed, ease: "easeOut" }}
      >
        <ellipse cx="0" cy="0" rx="1.95" ry="1.5" transform="rotate(-24)" fill={accent} stroke="none" />
        <ellipse cx="4.9" cy="-1" rx="1.95" ry="1.5" transform="rotate(-24 4.9 -1)" fill={accent} stroke="none" />
        <path d="M1.75 -0.6 V-8.2 M6.65 -1.6 V-9.2" stroke={accent} strokeWidth={strokeWidth * 0.68} />
        <path d="M1.75 -8.2 6.65 -9.2" stroke={accent} strokeWidth={strokeWidth * 1.1} />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { x: [17.69, 17.65, 17.58, 17.49, 17.38, 17.26, 17.13, 17, 16.87, 16.75, 16.65, 15.77, 15.71, 15.68, 15.68, 15.72, 15.78, 15.87, 15.99, 16.13, 16.28, 16.46, 16.64, 16.82, 17, 17.16, 17.32, 17.45, 17.55, 17.63, 17.68, 17.7, 17.69], y: [12.5, 12.22, 11.96, 11.72, 11.5, 11.31, 11.15, 11.02, 10.92, 10.85, 10.81, 17.6, 17.57, 17.51, 17.42, 17.3, 17.14, 16.96, 16.76, 16.52, 16.27, 16, 15.7, 15.4, 15.08, 14.75, 14.42, 14.09, 13.76, 13.43, 13.11, 12.8, 12.5], rotate: [3.56, 2.55, 1.45, 0.28, -0.89, -2.03, -3.1, -4.04, -4.83, -5.43, -5.82, -5.99, -5.93, -5.64, -5.14, -4.44, -3.56, -2.55, -1.45, -0.28, 0.89, 2.03, 3.1, 4.04, 4.83, 5.43, 5.82, 5.99, 5.93, 5.64, 5.14, 4.44, 3.56], scale: [0.98, 0.97, 0.96, 0.94, 0.93, 0.91, 0.9, 0.88, 0.85, 0.83, 0.8, 0.78, 0.82, 0.85, 0.87, 0.89, 0.91, 0.92, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 0.99, 1, 1, 1, 1, 1, 0.99, 0.98, 0.98], opacity: [0.81, 0.73, 0.65, 0.57, 0.47, 0.38, 0.29, 0.21, 0.13, 0.07, 0.02, 0.01, 0.05, 0.11, 0.18, 0.27, 0.35, 0.44, 0.54, 0.62, 0.71, 0.78, 0.85, 0.91, 0.95, 0.98, 1, 1, 0.99, 0.96, 0.92, 0.87, 0.81] } : { x: 17.41, y: 14.2, rotate: 5.96, scale: 1, opacity: 1 }}
        transition={on ? { duration: 2.4 / speed, ease: "linear", repeat: Infinity } : { duration: 0.35 / speed, ease: "easeOut" }}
      >
        <ellipse cx="0" cy="0" rx="1.95" ry="1.5" transform="rotate(-24)" fill={"currentColor"} stroke="none" />
        <path d="M1.75 -0.6 V-8 C3.3 -7.4 4.8 -6.4 4.7 -3.7" stroke={"currentColor"} strokeWidth={strokeWidth * 0.68} />
      </motion.g>
    </svg>
  );
}
