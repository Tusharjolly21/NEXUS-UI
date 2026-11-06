"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ApertureIconProps = {
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

/** A camera iris: its six blades turn as the lit opening squeezes almost shut, then flares wide and settles. */
export function ApertureIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ApertureIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 40, 60] } : { rotate: 0 }}
        transition={on ? { duration: 0.9 / speed, times: [0, 0.5, 1], ease: "easeInOut" } : { duration: 0 / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M12 8.3L15.2 10.15L15.2 13.85L12 15.7L8.8 13.85L8.8 10.15Z"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { d: ["M12 8.3L15.2 10.15L15.2 13.85L12 15.7L8.8 13.85L8.8 10.15Z", "M12 10.75L13.08 11.38L13.08 12.62L12 13.25L10.92 12.62L10.92 11.38Z", "M12 6.7L16.59 9.35L16.59 14.65L12 17.3L7.41 14.65L7.41 9.35Z", "M12 8.3L15.2 10.15L15.2 13.85L12 15.7L8.8 13.85L8.8 10.15Z"] } : { d: "M12 8.3L15.2 10.15L15.2 13.85L12 15.7L8.8 13.85L8.8 10.15Z" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
        />
        <motion.path
          d="M12 8.3L20.89 13.43M15.2 10.15L15.2 20.41M15.2 13.85L6.32 18.98M12 15.7L3.11 10.57M8.8 13.85L8.8 3.59M8.8 10.15L17.68 5.02"
          strokeWidth={strokeWidth * 0.75}
          initial={false}
          animate={on ? { d: ["M12 8.3L20.89 13.43M15.2 10.15L15.2 20.41M15.2 13.85L6.32 18.98M12 15.7L3.11 10.57M8.8 13.85L8.8 3.59M8.8 10.15L17.68 5.02", "M12 10.75L20.28 15.53M13.08 11.38L13.08 20.93M13.08 12.62L4.8 17.4M12 13.25L3.72 8.47M10.92 12.62L10.92 3.07M10.92 11.38L19.2 6.6", "M12 6.7L21 11.9M16.59 9.35L16.59 19.74M16.59 14.65L7.59 19.85M12 17.3L3 12.1M7.41 14.65L7.41 4.26M7.41 9.35L16.41 4.15", "M12 8.3L20.89 13.43M15.2 10.15L15.2 20.41M15.2 13.85L6.32 18.98M12 15.7L3.11 10.57M8.8 13.85L8.8 3.59M8.8 10.15L17.68 5.02"] } : { d: "M12 8.3L20.89 13.43M15.2 10.15L15.2 20.41M15.2 13.85L6.32 18.98M12 15.7L3.11 10.57M8.8 13.85L8.8 3.59M8.8 10.15L17.68 5.02" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
        />
      </motion.g>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
