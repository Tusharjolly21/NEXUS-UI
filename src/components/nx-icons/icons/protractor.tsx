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

/** A blue angle wedge sweeps open across the protractor's scale, closes to thirty degrees, and rests at sixty. */
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
        d="M12 16.75L18 16.75A6.0 6.0 0 0 0 15 11.55Z"
        fill={accent}
        fillOpacity={0.3}
        stroke="none"
        initial={false}
        animate={on ? { d: ["M12 16.75L18 16.75A6.0 6.0 0 0 0 15 11.55Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 14.84 11.46Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 14.35 11.23Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 13.55 10.95Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 12.47 10.77Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 11.22 10.8Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 9.94 11.11Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 8.8 11.67Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 7.9 12.37Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 7.29 13.03Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 6.94 13.52Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 6.81 13.74Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 6.91 13.57Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 7.38 12.92Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 8.35 11.98Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 9.88 11.14Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 11.8 10.75Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 13.76 11.01Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 15.38 11.8Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 16.46 12.74Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 17.03 13.48Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 17.2 13.75Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 17.12 13.62Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 16.88 13.25Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 16.48 12.76Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 15.99 12.27Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 15.5 11.87Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 15.13 11.63Z", "M12 16.75L18 16.75A6.0 6.0 0 0 0 15 11.55Z"] } : { d: "M12 16.75L18 16.75A6.0 6.0 0 0 0 15 11.55Z" }}
        transition={{ duration: 1 / speed, ease: "linear" }}
      />
      <motion.path
        d="M12 16.75L15 11.55"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M12 16.75L15 11.55", "M12 16.75L14.84 11.46", "M12 16.75L14.35 11.23", "M12 16.75L13.55 10.95", "M12 16.75L12.47 10.77", "M12 16.75L11.22 10.8", "M12 16.75L9.94 11.11", "M12 16.75L8.8 11.67", "M12 16.75L7.9 12.37", "M12 16.75L7.29 13.03", "M12 16.75L6.94 13.52", "M12 16.75L6.81 13.74", "M12 16.75L6.91 13.57", "M12 16.75L7.38 12.92", "M12 16.75L8.35 11.98", "M12 16.75L9.88 11.14", "M12 16.75L11.8 10.75", "M12 16.75L13.76 11.01", "M12 16.75L15.38 11.8", "M12 16.75L16.46 12.74", "M12 16.75L17.03 13.48", "M12 16.75L17.2 13.75", "M12 16.75L17.12 13.62", "M12 16.75L16.88 13.25", "M12 16.75L16.48 12.76", "M12 16.75L15.99 12.27", "M12 16.75L15.5 11.87", "M12 16.75L15.13 11.63", "M12 16.75L15 11.55"] } : { d: "M12 16.75L15 11.55" }}
        transition={{ duration: 1 / speed, ease: "linear" }}
      />
      <path d="M20.02 14.6L21.18 14.29M19.19 12.6L20.23 12M17.16 11.59L18.72 10.03M16.15 9.56L16.75 8.52M14.15 8.73L14.46 7.57M12 9.45L12 7.25M9.85 8.73L9.54 7.57M7.85 9.56L7.25 8.52M6.84 11.59L5.28 10.03M4.81 12.6L3.77 12M3.98 14.6L2.82 14.29" strokeWidth={strokeWidth * 0.5} />
      <path d="M10.4 16.75A1.6 1.6 0 0 1 13.6 16.75" strokeWidth={strokeWidth * 0.5} />
      <path d="M2.5 16.75A9.5 9.5 0 0 1 21.5 16.75Z" />
    </svg>
  );
}
