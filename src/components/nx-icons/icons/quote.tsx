"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type QuoteIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Two quotation marks swing in one after the other, each pivoting on its round head until the curved tail settles. */
export function QuoteIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: QuoteIconProps) {
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
      <g transform="translate(-0.21 -0.42)">
        <motion.g
          style={{ originX: "29.709%", originY: "37.5%" }}
          initial={false}
          animate={on ? { rotate: [-55, 9, 0], scale: [0.4, 1.06, 1], opacity: [0, 1, 1] } : { rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 / speed, delay: (on ? 0 : 0) / speed, times: [0, 0.65, 1], ease: ["easeOut", "easeInOut"], opacity: { duration: 0.15 / speed, delay: (on ? 0 : 0) / speed } }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M5.583 10.702L5.779 10.832L5.964 10.965L6.137 11.1L6.299 11.237L6.449 11.375L6.59 11.515L6.719 11.656L6.839 11.798L6.949 11.941L7.049 12.085L7.14 12.231L7.222 12.379L7.294 12.528L7.357 12.679L7.412 12.833L7.457 12.99L7.492 13.15L7.517 13.313L7.532 13.48L7.536 13.651L7.528 13.826L7.507 14.006L7.473 14.189L7.426 14.377L7.363 14.568L7.285 14.762L7.19 14.959L7.078 15.158L6.948 15.358L6.801 15.559L6.634 15.759L6.449 15.959L6.244 16.156L6.019 16.351L5.775 16.543L5.51 16.73L5.226 16.912L4.922 17.089L4.597 17.26L4.254 17.427L4.607 18.573L5.026 18.49L5.433 18.39L5.826 18.277L6.206 18.15L6.574 18.011L6.929 17.859L7.271 17.694L7.6 17.516L7.916 17.326L8.219 17.123L8.508 16.906L8.782 16.677L9.042 16.435L9.287 16.18L9.516 15.913L9.729 15.633L9.924 15.341L10.102 15.038L10.26 14.724L10.4 14.399L10.519 14.065L10.617 13.723L10.694 13.373L10.749 13.017L10.782 12.655L10.793 12.289L10.782 11.921L10.748 11.55L10.692 11.179L10.614 10.808L10.514 10.439L10.392 10.071L10.249 9.707L10.085 9.346L9.9 8.99L9.695 8.639L9.47 8.293L9.225 7.955L8.961 7.623L8.677 7.298Z" fill={accent} stroke={accent} strokeWidth="1" />
          <circle cx="4.43" cy="18" r="1.1" fill={accent} stroke="none" />
          <circle cx="7.13" cy="9" r="3.1" fill="currentColor" stroke="none" />
        </motion.g>
        <motion.g
          style={{ originX: "70.291%", originY: "37.5%" }}
          initial={false}
          animate={on ? { rotate: [-55, 9, 0], scale: [0.4, 1.06, 1], opacity: [0, 1, 1] } : { rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 / speed, delay: (on ? 0.2 : 0) / speed, times: [0, 0.65, 1], ease: ["easeOut", "easeInOut"], opacity: { duration: 0.15 / speed, delay: (on ? 0.2 : 0) / speed } }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M15.323 10.702L15.519 10.832L15.704 10.965L15.877 11.1L16.038 11.237L16.189 11.375L16.329 11.515L16.459 11.656L16.579 11.798L16.689 11.941L16.789 12.085L16.88 12.231L16.961 12.379L17.034 12.528L17.097 12.679L17.152 12.833L17.196 12.99L17.232 13.15L17.257 13.313L17.272 13.48L17.275 13.651L17.267 13.826L17.247 14.006L17.213 14.189L17.165 14.377L17.103 14.568L17.024 14.762L16.93 14.959L16.818 15.158L16.688 15.358L16.541 15.559L16.374 15.759L16.189 15.959L15.984 16.156L15.759 16.351L15.515 16.543L15.25 16.73L14.966 16.912L14.662 17.089L14.337 17.26L13.993 17.427L14.346 18.573L14.766 18.49L15.172 18.39L15.566 18.277L15.946 18.15L16.314 18.011L16.669 17.859L17.011 17.694L17.34 17.516L17.656 17.326L17.959 17.123L18.248 16.906L18.522 16.677L18.782 16.435L19.027 16.18L19.256 15.913L19.469 15.633L19.664 15.341L19.842 15.038L20 14.724L20.139 14.399L20.258 14.065L20.357 13.723L20.434 13.373L20.489 13.017L20.522 12.655L20.533 12.289L20.522 11.921L20.488 11.55L20.432 11.179L20.354 10.808L20.254 10.439L20.132 10.071L19.989 9.707L19.825 9.346L19.64 8.99L19.435 8.639L19.21 8.293L18.965 7.955L18.7 7.623L18.417 7.298Z" fill={accent} stroke={accent} strokeWidth="1" />
          <circle cx="14.17" cy="18" r="1.1" fill={accent} stroke="none" />
          <circle cx="16.87" cy="9" r="3.1" fill="currentColor" stroke="none" />
        </motion.g>
      </g>
    </svg>
  );
}
