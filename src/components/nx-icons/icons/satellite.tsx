"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SatelliteIconProps = {
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

/** The solar panels tilt towards the sun while signal arcs pulse out from the dish. */
export function SatelliteIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SatelliteIconProps) {
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
      <g transform="rotate(-45 12 12)">
        <rect x="10" y="10" width="4" height="4" rx="1" />
        <motion.g
          style={{ originX: "58.33%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, -16, 10, -4, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M14 12H17" /><rect x="17" y="9" width="5.2" height="6" rx="0.5" /><path d="M17 12H22.2" strokeWidth={strokeWidth * 0.5} opacity="0.6" />
        </motion.g>
        <motion.g
          style={{ originX: "41.67%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, -16, 10, -4, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M10 12H7" /><rect x="1.8" y="9" width="5.2" height="6" rx="0.5" /><path d="M1.8 12H7" strokeWidth={strokeWidth * 0.5} opacity="0.6" />
        </motion.g>
        <path d="M12 14V16.9" strokeWidth={strokeWidth * 0.75} />
        <path d="M9.6 18.36A2.7 2.7 0 0 1 14.4 18.36" strokeWidth={strokeWidth * 0.75} />
        {["M13.8 20.51A2.8 2.8 0 0 1 10.2 20.51", "M15.21 22.19A5 5 0 0 1 8.79 22.19"].map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke={accent}
            strokeWidth={strokeWidth * 0.75}
            initial={false}
            animate={on ? { pathLength: [0, 1, 1], opacity: [0, 1, 0] } : { opacity: 0 }}
            transition={{ duration: 0.6 / speed, delay: (on ? 0.2 + i * 0.2 : 0) / speed }}
          />
        ))}
      </g>
    </svg>
  );
}
