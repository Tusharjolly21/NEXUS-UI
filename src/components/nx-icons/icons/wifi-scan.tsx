"use client";

import { motion, useReducedMotion } from "framer-motion";

export type WifiScanIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** Wi-Fi arcs that light up from the dot outward, as if searching for a network. */
export function WifiScanIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WifiScanIconProps) {
  const reduce = useReducedMotion();
  const on = !reduce && (play ?? true);
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
      aria-hidden="true"
    >
      <circle cx="12" cy="19.5" r="1.3" fill={accent} stroke="none" />
      {["M9.17 16.67A4 4 0 0 1 14.83 16.67", "M6.34 13.84A8 8 0 0 1 17.66 13.84", "M3.51 11.01A12 12 0 0 1 20.49 11.01"].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          initial={{ opacity: 0.2 }}
          animate={on ? { opacity: [0.2, 1, 0.2] } : { opacity: 1 }}
          transition={on ? { duration: 1.3 / speed, ease: "easeInOut", repeat: Infinity, delay: (i * 0.17) / speed } : { duration: 0.3 / speed }}
        />
      ))}
    </svg>
  );
}
