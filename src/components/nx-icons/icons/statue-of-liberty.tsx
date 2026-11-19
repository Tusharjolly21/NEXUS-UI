"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StatueOfLibertyIconProps = {
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

/** The raised torch lifts a little higher and its flame flares up and flickers before settling. */
export function StatueOfLibertyIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StatueOfLibertyIconProps) {
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
      <g transform="translate(0.75 -0.46)">

      <motion.g
        style={{ originX: "53.33%", originY: "47.5%" }}
        initial={false}
        animate={on ? { rotate: [0, -3, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.62, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M17.4 2.5C19 4.54 18.6 6.2 17.4 6.2C16.2 6.2 15.8 4.54 17.4 2.5Z"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scale: [1, 1.3, 0.9, 1.15, 1], skewX: [0, -8, 6, -3, 0] } : { scale: 1, skewX: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.5, 0.72, 1], ease: "easeInOut" }}
        />
        <path d="M12.8 11.4L17.4 6.2" />
        <path d="M16.3 6.2H18.5" />
      </motion.g>
      <path d="M10.6 7.2V11.4" />
      <path d="M8 18.6L8.59 12.48A1.2 1.2 0 0 1 9.79 11.4L12.61 11.4A1.2 1.2 0 0 1 13.79 12.37L15 18.6" />
      <circle cx="10.6" cy="7.2" r="2.3" fill="currentColor" stroke="none" />
      <path d="M8.73 6.48L7.31 5.3L9.05 5.94ZM9.34 5.65L8.7 3.91L9.88 5.33ZM10.29 5.22L10.6 3.4L10.91 5.22ZM11.32 5.33L12.5 3.91L11.86 5.65ZM12.15 5.94L13.89 5.3L12.47 6.48Z" fill="currentColor" strokeWidth={strokeWidth * 0.3} />
      <path d="M8.6 12.4L4.82 13.86" />
      <path d="M3.42 14A0.4 0.4 0 0 1 3.71 13.52L5.07 13.18A0.4 0.4 0 0 1 5.55 13.47L6.18 16A0.4 0.4 0 0 1 5.89 16.48L4.53 16.82A0.4 0.4 0 0 1 4.05 16.53Z" fill="currentColor" strokeWidth={strokeWidth * 0.5} />
      <path d="M7 19.5A0.9 0.9 0 0 1 7.9 18.6L16.1 18.6A0.9 0.9 0 0 1 17 19.5L17 20.5A0.9 0.9 0 0 1 16.1 21.4L7.9 21.4A0.9 0.9 0 0 1 7 20.5Z" />
      </g>
    </svg>
  );
}
