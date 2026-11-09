"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type DroneIconProps = {
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

/** A quadcopter that bobs up and down while its four rotors spin into a blur. */
export function DroneIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: DroneIconProps) {
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
        animate={on ? { y: [0, -1.3, 0.5, -0.8, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.28, 0.58, 0.8, 1], ease: "easeInOut" }}
      >
        <path d="M9.44 9.44L6.94 6.94M9.44 14.56L6.94 17.06M14.56 9.44L17.06 6.94M14.56 14.56L17.06 17.06" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" />
        <circle cx="12" cy="16.4" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="5.1" cy="5.1" r="2.6" />
        <motion.circle
          cx="5.1"
          cy="5.1"
          r="2.6"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0.3, 0.3, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.15, 0.8, 1] }}
        />
        <motion.g
          style={{ originX: "21.25%", originY: "21.25%" }}
          initial={false}
          animate={on ? { rotate: [0, 720], opacity: [0, 1, 1, 0] } : { rotate: 0, opacity: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut", times: [0, 0.15, 0.8, 1] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M3.5 5.1h3.2" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <circle cx="18.9" cy="5.1" r="2.6" />
        <motion.circle
          cx="18.9"
          cy="5.1"
          r="2.6"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0.3, 0.3, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.15, 0.8, 1] }}
        />
        <motion.g
          style={{ originX: "78.75%", originY: "21.25%" }}
          initial={false}
          animate={on ? { rotate: [0, 720], opacity: [0, 1, 1, 0] } : { rotate: 0, opacity: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut", times: [0, 0.15, 0.8, 1] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M17.3 5.1h3.2" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <circle cx="5.1" cy="18.9" r="2.6" />
        <motion.circle
          cx="5.1"
          cy="18.9"
          r="2.6"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0.3, 0.3, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.15, 0.8, 1] }}
        />
        <motion.g
          style={{ originX: "21.25%", originY: "78.75%" }}
          initial={false}
          animate={on ? { rotate: [0, 720], opacity: [0, 1, 1, 0] } : { rotate: 0, opacity: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut", times: [0, 0.15, 0.8, 1] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M3.5 18.9h3.2" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <circle cx="18.9" cy="18.9" r="2.6" />
        <motion.circle
          cx="18.9"
          cy="18.9"
          r="2.6"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0.3, 0.3, 0] } : { fillOpacity: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.15, 0.8, 1] }}
        />
        <motion.g
          style={{ originX: "78.75%", originY: "78.75%" }}
          initial={false}
          animate={on ? { rotate: [0, 720], opacity: [0, 1, 1, 0] } : { rotate: 0, opacity: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut", times: [0, 0.15, 0.8, 1] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M17.3 18.9h3.2" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
