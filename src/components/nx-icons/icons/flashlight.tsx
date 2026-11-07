"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FlashlightIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A torch whose switch clicks, the beam flickers on and the three rays fan out from the lens. */
export function FlashlightIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FlashlightIconProps) {
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
        initial={false}
        animate={on ? { opacity: [1, 0, 0, 1, 0.35, 1, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.3, 0.42, 0.52, 0.62, 1] }}
      >
        <motion.g
          style={{ originX: "50%", originY: "37.5%" }}
          initial={false}
          animate={on ? { rotate: [0, 42, 42, -6, 0], scale: [1, 0.5, 0.5, 1.12, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.3, 0.32, 0.62, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M9.59 6.32 7.65 4.17" stroke={accent} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "37.5%" }}
          initial={false}
          animate={on ? { rotate: [0, -42, -42, 6, 0], scale: [1, 0.5, 0.5, 1.12, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.3, 0.32, 0.62, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M14.41 6.32 16.35 4.17" stroke={accent} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "37.5%" }}
          initial={false}
          animate={on ? { scale: [1, 0.5, 0.5, 1.12, 1] } : { scale: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.3, 0.32, 0.62, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 5.4 12 2.5" stroke={accent} />
        </motion.g>
      </motion.g>
      <path d="M7 9l2 4h6l2-4" />
      <path d="M9 13v7a1.5 1.5 0 0 0 1.5 1.5h3A1.5 1.5 0 0 0 15 20v-7" />
      <motion.path
        d="M7 9h10"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [1, 0.3, 0.3, 1, 0.45, 1, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.3, 0.42, 0.52, 0.62, 1] }}
      />
      <motion.path
        d="M12 15.8v1.6"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, 1.4, 0] } : { y: 0 }}
        transition={{ duration: 0.4 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
