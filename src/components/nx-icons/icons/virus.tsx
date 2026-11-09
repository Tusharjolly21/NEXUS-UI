"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VirusIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The eight spikes push out one after another round the body while it rolls slightly. */
export function VirusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VirusIconProps) {
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
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <g key={a} transform={`rotate(${a} 12 12)`}>
          <motion.g
            initial={false}
            animate={on ? { y: [0, -1, 0] } : { y: 0 }}
            transition={{ duration: 0.4 / speed, delay: (on ? i * 0.07 : 0) / speed, ease: "easeInOut" }}
          >
            <path d="M12 6.7V2.95" /><circle cx="12" cy="2.95" r="1.45" fill={accent} stroke="none" />
          </motion.g>
        </g>
      ))}
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -16, 10, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <circle cx="12" cy="12" r="5.3" />
        <circle cx="10.2" cy="10.2" r="0.95" fill="currentColor" stroke="none" />
        <circle cx="13.8" cy="13.8" r="0.95" fill="currentColor" stroke="none" />
        <circle cx="13.6" cy="10.4" r="0.7" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
