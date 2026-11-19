"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GrapesIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #af52de. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A bunch of grapes sways from its stem as the grapes plump up one after another from top to bottom. */
export function GrapesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GrapesIconProps) {
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
      <g transform="translate(0 1)">

      <motion.g
        style={{ originX: "53.75%", originY: "16.88%" }}
        initial={false}
        animate={on ? { rotate: [0, 5, -4, 2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.95 / speed, times: [0, 0.25, 0.52, 0.76, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 7.1Q12 4.95 12.9 4.05" />
        <path d="M12.9 4.05Q16.31 5.81 17.29 2.1Q13.87 0.33 12.9 4.05Z" />
        <motion.g
          style={{ originX: "30%", originY: "40%" }}
          initial={false}
          animate={on ? { scale: [1, 1.1, 0.97, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (0.08) / speed, times: [0, 0.4, 0.75, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="7.2" cy="9.6" r="2.5" fill={accent} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "40%" }}
          initial={false}
          animate={on ? { scale: [1, 1.1, 0.97, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (0.15) / speed, times: [0, 0.4, 0.75, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="12" cy="9.6" r="2.5" fill={accent} />
        </motion.g>
        <motion.g
          style={{ originX: "70%", originY: "40%" }}
          initial={false}
          animate={on ? { scale: [1, 1.1, 0.97, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (0.23) / speed, times: [0, 0.4, 0.75, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="16.8" cy="9.6" r="2.5" fill={accent} />
        </motion.g>
        <motion.g
          style={{ originX: "40%", originY: "57.32%" }}
          initial={false}
          animate={on ? { scale: [1, 1.1, 0.97, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (0.3) / speed, times: [0, 0.4, 0.75, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="9.6" cy="13.76" r="2.5" fill={accent} />
        </motion.g>
        <motion.g
          style={{ originX: "60%", originY: "57.32%" }}
          initial={false}
          animate={on ? { scale: [1, 1.1, 0.97, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (0.38) / speed, times: [0, 0.4, 0.75, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="14.4" cy="13.76" r="2.5" fill={accent} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "74.64%" }}
          initial={false}
          animate={on ? { scale: [1, 1.1, 0.97, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 / speed, delay: (0.46) / speed, times: [0, 0.4, 0.75, 1], ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="12" cy="17.91" r="2.5" fill={accent} />
        </motion.g>
      </motion.g>

      </g>
    </svg>
  );
}
