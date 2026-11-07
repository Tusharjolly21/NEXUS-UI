"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type EqualizerIconProps = {
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

/** Five sliders whose knobs glide to new settings one after another and settle back where they began. */
export function EqualizerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: EqualizerIconProps) {
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
      <path d="M3.5 3.5V20.5M7.75 3.5V20.5M12 3.5V20.5M16.25 3.5V20.5M20.5 3.5V20.5" />
      <motion.g
        initial={false}
        animate={on ? { y: [0, -8, -3, 0] } : { y: 0 }}
        transition={{ duration: 0.95 / speed, delay: (0) / speed, ease: "easeInOut" }}
      >
        <rect x="1.8" y="14.2" width="3.4" height="2.6" rx="1" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, 6, 2, 0] } : { y: 0 }}
        transition={{ duration: 0.95 / speed, delay: (0.05) / speed, ease: "easeInOut" }}
      >
        <rect x="6.05" y="7.2" width="3.4" height="2.6" rx="1" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, -4, 4, 0] } : { y: 0 }}
        transition={{ duration: 0.95 / speed, delay: (0.1) / speed, ease: "easeInOut" }}
      >
        <rect x="10.3" y="11.2" width="3.4" height="2.6" rx="1" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, 8, 4, 0] } : { y: 0 }}
        transition={{ duration: 0.95 / speed, delay: (0.15) / speed, ease: "easeInOut" }}
      >
        <rect x="14.55" y="5.2" width="3.4" height="2.6" rx="1" fill={accent} stroke="none" />
      </motion.g>
      <motion.g
        initial={false}
        animate={on ? { y: [0, -6, -2, 0] } : { y: 0 }}
        transition={{ duration: 0.95 / speed, delay: (0.2) / speed, ease: "easeInOut" }}
      >
        <rect x="18.8" y="12.2" width="3.4" height="2.6" rx="1" fill={accent} stroke="none" />
      </motion.g>
    </svg>
  );
}
