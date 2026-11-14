"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GlobeIconProps = {
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

/** The meridian ellipse rotates round the globe, swelling to the rim and thinning to a line, and settles back where it started. */
export function GlobeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GlobeIconProps) {
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
        <motion.ellipse
          cx="12"
          cy="12"
          rx="3.973"
          ry="9.4"
          stroke={accent}
          initial={false}
          animate={on ? { rx: [3.973, 5.051, 6.042, 6.93, 7.7, 8.338, 8.833, 9.177, 9.364, 9.391, 9.257, 8.965, 8.519, 7.928, 7.201, 6.351, 5.392, 4.34, 3.215, 2.035, 0.819, 0.41, 1.632, 2.827, 3.973] } : { rx: 3.973 }}
          transition={{ duration: 1 / speed, times: [0, 0.123, 0.1775, 0.2211, 0.2591, 0.2939, 0.3264, 0.3572, 0.387, 0.4159, 0.4442, 0.4722, 0.5, 0.5278, 0.5558, 0.5841, 0.613, 0.6428, 0.6736, 0.7061, 0.7409, 0.7789, 0.8225, 0.877, 1], ease: "linear" }}
        />
        <path d="M3.859 7.3 H20.141 M3.859 16.7 H20.141 M2.6 12 H21.4" strokeWidth={strokeWidth * 0.75} />
        <circle cx="12" cy="12" r="9.4" />
      </g>
    </svg>
  );
}
