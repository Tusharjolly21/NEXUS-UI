"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TranslateIconProps = {
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

/** Two overlapping speech tiles that flip in turn, trading the letter and the character, then flip back. */
export function TranslateIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TranslateIconProps) {
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
        style={{ originX: "34.4%", originY: "32.3%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0, 1, 1, 0, 1] } : { scaleX: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.18, 0.36, 0.64, 0.82, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.2 13.5H4.5a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2H12a2 2 0 0 1 2 2V7" />
        <motion.g
          initial={false}
          animate={on ? { opacity: [1, 1, 0, 0, 1, 1] } : { opacity: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.17, 0.19, 0.81, 0.83, 1], ease: "linear" }}
        >
          <path d="M5.8 10.4 8.25 4.8 10.7 10.4M6.8 8.4h2.9" stroke={accent} strokeWidth={1.6} />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { opacity: [0, 0, 1, 1, 0, 0] } : { opacity: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.17, 0.19, 0.81, 0.83, 1], ease: "linear" }}
        >
          <path d="M8.25 4.1v1.2M5.4 6h5.7M6.1 10.2 10.3 6.2M10.4 10.2 6.2 6.2" strokeWidth={1.6} />
        </motion.g>
      </motion.g>
      <motion.g
        style={{ originX: "65.6%", originY: "67.7%" }}
        initial={false}
        animate={on ? { scaleX: [1, 0, 1, 1, 0, 1] } : { scaleX: 1 }}
        transition={{ duration: 1 / speed, delay: (0.1) / speed, times: [0, 0.18, 0.36, 0.64, 0.82, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M10 10.5h9.5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2z" />
        <motion.g
          initial={false}
          animate={on ? { opacity: [1, 1, 0, 0, 1, 1] } : { opacity: 1 }}
          transition={{ duration: 1 / speed, delay: (0.1) / speed, times: [0, 0.17, 0.19, 0.81, 0.83, 1], ease: "linear" }}
        >
          <path d="M15.75 12.9v1.2M12.9 14.8h5.7M13.6 19 17.8 15M18 19 13.8 15" strokeWidth={1.6} />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { opacity: [0, 0, 1, 1, 0, 0] } : { opacity: 0 }}
          transition={{ duration: 1 / speed, delay: (0.1) / speed, times: [0, 0.17, 0.19, 0.81, 0.83, 1], ease: "linear" }}
        >
          <path d="M13.3 19.2 15.75 13.6 18.2 19.2M14.3 17.2h2.9" stroke={accent} strokeWidth={1.6} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
