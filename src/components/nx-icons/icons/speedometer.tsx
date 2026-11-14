"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SpeedometerIconProps = {
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

/** The needle revs round the dial into the coloured zone, the zone flashes as it arrives, then the needle wobbles, settles and drops back to zero. */
export function SpeedometerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SpeedometerIconProps) {
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
      <g transform="translate(0 1.38)">
        <motion.path
          d="M21.08 9.567A9.4 9.4 0 0 1 18.647 18.647"
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [1, 1, 0.3, 1, 1] } : { opacity: 1 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.2, 0.38, 0.55, 1] }}
        />
        <path d="M5.353 18.647A9.4 9.4 0 1 1 21.08 9.567" />
        <path d="M7.05 16.95L8.182 15.818M5.239 13.812L5.818 13.656M5.239 10.188L5.818 10.344M7.05 7.05L8.182 8.182M10.188 5.239L10.344 5.818M13.812 5.239L13.656 5.818M16.95 7.05L15.818 8.182M18.761 10.188L18.182 10.344M18.761 13.812L18.182 13.656M16.95 16.95L15.818 15.818" strokeWidth={strokeWidth * 0.75} />
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, 250, 234, 244, 0] } : { rotate: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.38, 0.5, 0.62, 1], ease: ["easeOut", "easeInOut", "easeInOut", "easeInOut"] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 12L9.737 14.263" strokeWidth={strokeWidth * 0.8} />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </motion.g>
      </g>
    </svg>
  );
}
