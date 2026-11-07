"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HandshakeIconProps = {
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

/** The two hands pull back, clasp together with a small shake, and a sparkle flashes on the join. */
export function HandshakeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HandshakeIconProps) {
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
        animate={on ? { y: [0, 0, 0, -1.1, 0.9, -0.5, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.4, 0.5, 0.6, 0.72, 0.85], ease: "easeInOut" }}
      >
        <motion.g
          initial={false}
          animate={on ? { x: [0, -1.8, 0.3, 0, 0, 0, 0] } : { x: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.4, 0.5, 0.6, 0.72, 0.85], ease: "easeInOut" }}
        >
          <path d="M5.7 9.6H7L9.8 6.6H12" />
          <path d="M5.7 13.2H6.2L9.4 16.4A1.3 1.3 0 0 0 12 17.2" />
          <path d="M9.4 9.6 12.2 12.2" />
          <rect x="2" y="7.2" width="3.7" height="8" rx="1.2" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { x: [0, 1.8, -0.3, 0, 0, 0, 0] } : { x: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.25, 0.4, 0.5, 0.6, 0.72, 0.85], ease: "easeInOut" }}
        >
          <path d="M12 6.6H14.2L17 9.6H18.3" />
          <path d="M12 17.2A1.3 1.3 0 0 0 14.6 16.4L17.8 13.2H18.3" />
          <path d="M13.8 10.6 16 12.6" />
          <rect x="18.3" y="7.2" width="3.7" height="8" rx="1.2" fill={accent} stroke="none" />
        </motion.g>
      </motion.g>
      <motion.path
        d="M12 1.6Q12 3.6 14 3.6Q12 3.6 12 5.6Q12 3.6 10 3.6Q12 3.6 12 1.6z"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "15%" }}
        initial={false}
        animate={on ? { scale: [0, 1.3, 1, 0], rotate: [0, 45, 90, 90], opacity: [0, 1, 1, 0] } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.6 / speed, delay: (0.4) / speed, times: [0, 0.35, 0.7, 1] }}
      />
    </svg>
  );
}
