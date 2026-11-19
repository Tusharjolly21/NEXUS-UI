"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type OctopusIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The octopus jets upward with its tentacles pulled together, then splays them wide and drifts back. */
export function OctopusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: OctopusIconProps) {
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
      <g transform="translate(0 0.33)">

      <motion.g
        initial={false}
        animate={on ? { y: [0, -1.3, 0.5, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.32, 0.68, 1], ease: "easeInOut" }}
      >
        <motion.path
          d="M17.26 10.81C19.16 12.01 19.8 14.2 19.8 16.2C19.8 18.2 20.3 19.4 21.3 18.9M6.74 10.81C4.84 12.01 4.2 14.2 4.2 16.2C4.2 18.2 3.7 19.4 2.7 18.9M14.45 13.57C14.95 14.97 14.8 15.9 15.3 17.4C15.8 19 16 20.7 17.5 20.6M9.55 13.57C9.05 14.97 9.2 15.9 8.7 17.4C8.2 19 8 20.7 6.5 20.6"
          initial={false}
          animate={on ? { d: ["M17.26 10.81C19.16 12.01 19.8 14.2 19.8 16.2C19.8 18.2 20.3 19.4 21.3 18.9M6.74 10.81C4.84 12.01 4.2 14.2 4.2 16.2C4.2 18.2 3.7 19.4 2.7 18.9M14.45 13.57C14.95 14.97 14.8 15.9 15.3 17.4C15.8 19 16 20.7 17.5 20.6M9.55 13.57C9.05 14.97 9.2 15.9 8.7 17.4C8.2 19 8 20.7 6.5 20.6", "M17.26 10.81C19.16 12.01 18.2 14.8 18.2 16.8C18.2 18.8 17.7 21 18.7 20.5M6.74 10.81C4.84 12.01 5.8 14.8 5.8 16.8C5.8 18.8 6.3 21 5.3 20.5M14.45 13.57C14.95 14.97 14 16.5 14.5 18C15 19.6 14.2 21.3 15.7 21.2M9.55 13.57C9.05 14.97 10 16.5 9.5 18C9 19.6 9.8 21.3 8.3 21.2", "M17.26 10.81C19.16 12.01 20.4 13 20.4 15C20.4 17 20.3 17.4 21.3 16.9M6.74 10.81C4.84 12.01 3.6 13 3.6 15C3.6 17 3.7 17.4 2.7 16.9M14.45 13.57C14.95 14.97 15.6 15.1 16.1 16.6C16.6 18.2 16.6 19.1 18.1 19M9.55 13.57C9.05 14.97 8.4 15.1 7.9 16.6C7.4 18.2 7.4 19.1 5.9 19", "M17.26 10.81C19.16 12.01 19.8 14.2 19.8 16.2C19.8 18.2 20.3 19.4 21.3 18.9M6.74 10.81C4.84 12.01 4.2 14.2 4.2 16.2C4.2 18.2 3.7 19.4 2.7 18.9M14.45 13.57C14.95 14.97 14.8 15.9 15.3 17.4C15.8 19 16 20.7 17.5 20.6M9.55 13.57C9.05 14.97 9.2 15.9 8.7 17.4C8.2 19 8 20.7 6.5 20.6"] } : { d: "M17.26 10.81C19.16 12.01 19.8 14.2 19.8 16.2C19.8 18.2 20.3 19.4 21.3 18.9M6.74 10.81C4.84 12.01 4.2 14.2 4.2 16.2C4.2 18.2 3.7 19.4 2.7 18.9M14.45 13.57C14.95 14.97 14.8 15.9 15.3 17.4C15.8 19 16 20.7 17.5 20.6M9.55 13.57C9.05 14.97 9.2 15.9 8.7 17.4C8.2 19 8 20.7 6.5 20.6" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.32, 0.68, 1], ease: "easeInOut" }}
        />
        <path d="M6.2 8.4A5.8 5.7 0 1 1 17.8 8.4A5.8 5.7 0 1 1 6.2 8.4Z" fill={accent} />
        <circle cx="9.6" cy="9.8" r="1.15" fill="currentColor" stroke="none" />
        <circle cx="14.4" cy="9.8" r="1.15" fill="currentColor" stroke="none" />
      </motion.g>

      </g>
    </svg>
  );
}
