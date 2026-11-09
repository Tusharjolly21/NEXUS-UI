"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PalmTreeIconProps = {
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

/** A palm tree whose fronds sway one after another in the breeze. */
export function PalmTreeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PalmTreeIconProps) {
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
      <path d="M8.6 20.95C9.6 17.75 12.8 16.55 12.4 13.35" />
      <motion.g
        style={{ originX: "50%", originY: "36.46%" }}
        initial={false}
        animate={on ? { rotate: [0, 9, -6, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 8.75Q7.05 9.45 5.18 13.65" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "36.46%" }}
        initial={false}
        animate={on ? { rotate: [0, 9, -6, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.1 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 8.75Q7.43 5.18 3.57 8.66" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "36.46%" }}
        initial={false}
        animate={on ? { rotate: [0, 9, -6, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.2 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 8.75Q12 5.35 13.93 3.05" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "36.46%" }}
        initial={false}
        animate={on ? { rotate: [0, 9, -6, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.3 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 8.75Q16.57 5.18 20.43 8.66" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "36.46%" }}
        initial={false}
        animate={on ? { rotate: [0, 9, -6, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.4 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 8.75Q16.95 9.45 18.82 13.65" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "36.46%" }}
        initial={false}
        animate={on ? { rotate: [0, 6, -4, 2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, delay: (on ? 0.2 : 0) / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="10.1" cy="11.55" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="14" cy="11.55" r="1.4" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
