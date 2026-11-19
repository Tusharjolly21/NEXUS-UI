"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SeashellIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5ac8fa. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The scallop shell rocks on the sand and a bright glint twinkles on its rim as it settles. */
export function SeashellIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SeashellIconProps) {
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
      <g transform="translate(0 -2.79)">

      <motion.g
        style={{ originX: "50%", originY: "76.67%" }}
        initial={false}
        animate={on ? { rotate: [0, -7, 5, -2.5, 0] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.22, 0.48, 0.74, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M9.51 17.13L4.07 14.36Q3.59 11.95 6.04 11.79Q6.46 9.36 8.81 10.09Q10.07 7.98 12 9.5Q13.93 7.98 15.19 10.09Q17.54 9.36 17.96 11.79Q20.41 11.95 19.93 14.36L14.49 17.13L15.18 19.83A0.7 0.7 0 0 1 14.5 20.7L9.5 20.7A0.7 0.7 0 0 1 8.82 19.83L9.51 17.13Z" />
        <path d="M9.51 17.13L14.49 17.13" />
        <path d="M6.65 15.68A6 6 0 0 1 17.35 15.68" strokeWidth={strokeWidth * 0.75} />
        <path d="M7.99 13.94L6.04 11.79M9.85 12.8L8.81 10.09M12 12.4L12 9.5M14.15 12.8L15.19 10.09M16.01 13.94L17.96 11.79" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
      <motion.path
        d="M18.2 3.5Q18.51 4.89 19.9 5.2Q18.51 5.51 18.2 6.9Q17.89 5.51 16.5 5.2Q17.89 4.89 18.2 3.5Z"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0, 0, 1.1, 0], opacity: [0, 0, 1, 0], rotate: [0, 0, 45, 90] } : { scale: 0, opacity: 0, rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.45, 0.7, 1], ease: "easeInOut" }}
      />
      </g>
    </svg>
  );
}
