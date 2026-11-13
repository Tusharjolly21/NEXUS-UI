"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ProtractorIconProps = {
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

/** A thin blue measuring arm swings out across the protractor's scale to 150 degrees, back to 30, and rests at 60. */
export function ProtractorIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ProtractorIconProps) {
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
        d="M12 16.75L16.75 8.52"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M12 16.75L16.75 8.52", "M12 16.75L16.5 8.38", "M12 16.75L15.73 8.01", "M12 16.75L14.46 7.57", "M12 16.75L12.75 7.28", "M12 16.75L10.77 7.33", "M12 16.75L8.74 7.83", "M12 16.75L6.93 8.71", "M12 16.75L5.51 9.81", "M12 16.75L4.54 10.86", "M12 16.75L3.99 11.64", "M12 16.75L3.78 11.99", "M12 16.75L3.94 11.72", "M12 16.75L4.69 10.68", "M12 16.75L6.23 9.2", "M12 16.75L8.64 7.86", "M12 16.75L11.68 7.26", "M12 16.75L14.79 7.67", "M12 16.75L17.36 8.9", "M12 16.75L19.07 10.4", "M12 16.75L19.96 11.57", "M12 16.75L20.23 12", "M12 16.75L20.1 11.79", "M12 16.75L19.72 11.21", "M12 16.75L19.1 10.43", "M12 16.75L18.32 9.65", "M12 16.75L17.54 9.03", "M12 16.75L16.96 8.65", "M12 16.75L16.75 8.52"] } : { d: "M12 16.75L16.75 8.52" }}
        transition={{ duration: 1 / speed, ease: "linear" }}
      />
      <path d="M20.12 15.02L21.29 14.77M19.58 13.37L20.68 12.89M18.71 11.87L19.69 11.17M17.55 10.58L18.36 9.69M15.55 10.6L16.75 8.52M14.56 8.86L14.94 7.71M12.87 8.5L12.99 7.3M11.13 8.5L11.01 7.3M9.44 8.86L9.06 7.71M8.45 10.6L7.25 8.52M6.45 10.58L5.64 9.69M5.29 11.87L4.31 11.17M4.42 13.37L3.32 12.89M3.88 15.02L2.71 14.77" strokeWidth={strokeWidth * 0.5} />
      <path d="M12 16.75V15.55" strokeWidth={strokeWidth * 0.5} />
      <path d="M7.6 16.75A4.4 4.4 0 0 1 16.4 16.75" strokeWidth={strokeWidth * 0.75} />
      <path d="M2.5 16.75A9.5 9.5 0 0 1 21.5 16.75Z" />
    </svg>
  );
}
