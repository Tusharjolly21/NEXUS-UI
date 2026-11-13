"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WalkIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A walking figure takes one full stride, legs and arms swinging past each other while speed lines stream behind. */
export function WalkIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WalkIconProps) {
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
      <g transform="translate(3 0.25)">
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { x: [0, -2, 0, 0], opacity: [1, 0.1, 1, 1] } : { x: 0, opacity: 1 }} transition={{ duration: 0.7 / speed, times: [0, 0.5, 0.9, 1], ease: "easeOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M2.6 10.4L5.4 10.4" stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { x: [0, -2, 0, 0], opacity: [1, 0.1, 1, 1] } : { x: 0, opacity: 1 }} transition={{ duration: 0.7 / speed, times: [0, 0.5, 0.9, 1], ease: "easeOut", delay: (0.1) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M2 15.4L4.8 15.4" stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, -0.4, 0, -0.4, 0] } : { y: 0 }} transition={{ duration: 1 / speed, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <circle cx="12.75" cy="4.6" r="2"  />
      <path d="M12.2 9.4L11.6 14.6"  />
      <motion.path d="M11.6 14.6L10.11 17.66L8.31 20.54"  initial={false} animate={on ? { d: ["M11.6 14.6L10.11 17.66L8.31 20.54", "M11.6 14.6L10.22 17.71L7.59 19.86", "M11.6 14.6L10.53 17.83L7.51 19.39", "M11.6 14.6L11.01 17.95L7.91 19.34", "M11.6 14.6L11.6 18L8.66 19.7", "M11.6 14.6L12.19 17.95L9.74 20.31", "M11.6 14.6L12.67 17.83L11.19 20.89", "M11.6 14.6L12.98 17.71L12.83 21.1", "M11.6 14.6L13.09 17.66L14.25 20.85", "M11.6 14.6L12.98 17.71L13.82 21", "M11.6 14.6L12.67 17.83L12.99 21.21", "M11.6 14.6L12.19 17.95L11.87 21.33", "M11.6 14.6L11.6 18L10.66 21.27", "M11.6 14.6L11.01 17.95L9.57 21.03", "M11.6 14.6L10.53 17.83L8.75 20.73", "M11.6 14.6L10.22 17.71L8.32 20.53", "M11.6 14.6L10.11 17.66L8.31 20.54"] } : { d: "M11.6 14.6L10.11 17.66L8.31 20.54" }} transition={{ duration: 1 / speed, times: [0, 0.06, 0.12, 0.19, 0.25, 0.31, 0.38, 0.44, 0.5, 0.56, 0.62, 0.69, 0.75, 0.81, 0.88, 0.94, 1], ease: "linear" }} />
      <motion.path d="M12.2 9.4L14.15 11.41L15.99 13.52"  initial={false} animate={on ? { d: ["M12.2 9.4L14.15 11.41L15.99 13.52", "M12.2 9.4L14.02 11.52L15.77 13.72", "M12.2 9.4L13.65 11.8L15.08 14.2", "M12.2 9.4L13.01 12.08L13.94 14.72", "M12.2 9.4L12.2 12.2L12.49 14.98", "M12.2 9.4L11.39 12.08L11.02 14.86", "M12.2 9.4L10.75 11.8L9.85 14.45", "M12.2 9.4L10.38 11.52L9.13 14.03", "M12.2 9.4L10.25 11.41L8.89 13.86", "M12.2 9.4L10.38 11.52L9.13 14.03", "M12.2 9.4L10.75 11.8L9.85 14.45", "M12.2 9.4L11.39 12.08L11.02 14.86", "M12.2 9.4L12.2 12.2L12.49 14.98", "M12.2 9.4L13.01 12.08L13.94 14.72", "M12.2 9.4L13.65 11.8L15.08 14.2", "M12.2 9.4L14.02 11.52L15.77 13.72", "M12.2 9.4L14.15 11.41L15.99 13.52"] } : { d: "M12.2 9.4L14.15 11.41L15.99 13.52" }} transition={{ duration: 1 / speed, times: [0, 0.06, 0.12, 0.19, 0.25, 0.31, 0.38, 0.44, 0.5, 0.56, 0.62, 0.69, 0.75, 0.81, 0.88, 0.94, 1], ease: "linear" }} />
      <motion.path d="M11.6 14.6L13.09 17.66L14.25 20.85"  initial={false} animate={on ? { d: ["M11.6 14.6L13.09 17.66L14.25 20.85", "M11.6 14.6L12.98 17.71L13.82 21", "M11.6 14.6L12.67 17.83L12.99 21.21", "M11.6 14.6L12.19 17.95L11.87 21.33", "M11.6 14.6L11.6 18L10.66 21.27", "M11.6 14.6L11.01 17.95L9.57 21.03", "M11.6 14.6L10.53 17.83L8.75 20.73", "M11.6 14.6L10.22 17.71L8.32 20.53", "M11.6 14.6L10.11 17.66L8.31 20.54", "M11.6 14.6L10.22 17.71L7.59 19.86", "M11.6 14.6L10.53 17.83L7.51 19.39", "M11.6 14.6L11.01 17.95L7.91 19.34", "M11.6 14.6L11.6 18L8.66 19.7", "M11.6 14.6L12.19 17.95L9.74 20.31", "M11.6 14.6L12.67 17.83L11.19 20.89", "M11.6 14.6L12.98 17.71L12.83 21.1", "M11.6 14.6L13.09 17.66L14.25 20.85"] } : { d: "M11.6 14.6L13.09 17.66L14.25 20.85" }} transition={{ duration: 1 / speed, times: [0, 0.06, 0.12, 0.19, 0.25, 0.31, 0.38, 0.44, 0.5, 0.56, 0.62, 0.69, 0.75, 0.81, 0.88, 0.94, 1], ease: "linear" }} />
      <motion.path d="M12.2 9.4L10.25 11.41L8.89 13.86"  initial={false} animate={on ? { d: ["M12.2 9.4L10.25 11.41L8.89 13.86", "M12.2 9.4L10.38 11.52L9.13 14.03", "M12.2 9.4L10.75 11.8L9.85 14.45", "M12.2 9.4L11.39 12.08L11.02 14.86", "M12.2 9.4L12.2 12.2L12.49 14.98", "M12.2 9.4L13.01 12.08L13.94 14.72", "M12.2 9.4L13.65 11.8L15.08 14.2", "M12.2 9.4L14.02 11.52L15.77 13.72", "M12.2 9.4L14.15 11.41L15.99 13.52", "M12.2 9.4L14.02 11.52L15.77 13.72", "M12.2 9.4L13.65 11.8L15.08 14.2", "M12.2 9.4L13.01 12.08L13.94 14.72", "M12.2 9.4L12.2 12.2L12.49 14.98", "M12.2 9.4L11.39 12.08L11.02 14.86", "M12.2 9.4L10.75 11.8L9.85 14.45", "M12.2 9.4L10.38 11.52L9.13 14.03", "M12.2 9.4L10.25 11.41L8.89 13.86"] } : { d: "M12.2 9.4L10.25 11.41L8.89 13.86" }} transition={{ duration: 1 / speed, times: [0, 0.06, 0.12, 0.19, 0.25, 0.31, 0.38, 0.44, 0.5, 0.56, 0.62, 0.69, 0.75, 0.81, 0.88, 0.94, 1], ease: "linear" }} />
      </motion.g>
      </g>
    </svg>
  );
}
