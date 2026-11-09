"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SharkIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5ac8fa. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A shark that glides forward with its tail sweeping from side to side while its dorsal fin cuts through the water. */
export function SharkIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SharkIconProps) {
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
        animate={on ? { x: [0, 0.9, 0.9, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
      >
        <motion.g
          style={{ originX: "24.58%", originY: "56.25%" }}
          initial={false}
          animate={on ? { rotate: [0, 10, -10, 7, -5, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M5.9 11.9 Q4.7 8.2 2.2 4.1 Q2.1 9.2 4.4 13.1 Q3.5 17 3 19.8 Q5.5 17.9 5.9 15.1Z" fill="currentColor" strokeWidth={1.2} />
        </motion.g>
        <path d="M14.9 9.3 Q13.7 5.6 10.7 2.9 Q10 6.8 9.3 9.8Z" fill={accent} stroke={accent} />
        <path d="M12.63 17.68 L10.1 21.5 L15.87 17.05Z" fill="currentColor" strokeWidth={1.2} />
        <path d="M5.9 11.9 C6.7 11 8.1 9.9 9.3 9.8 L14.9 9.3 C17.7 9.05 20 11.9 21.5 13.4 C18.9 16.8 10.5 20.2 5.9 15.1Z" />
        <path d="M11.6 12Q11 12.9 11.6 13.8 M13 12Q12.4 12.9 13 13.8 M14.4 12Q13.8 12.9 14.4 13.8" strokeWidth={strokeWidth * 0.5} />
        <path d="M12.22 15.5Q10.26 15.54 8.82 14.69" strokeWidth={strokeWidth * 0.5} opacity={0.5} />
        <path d="M16.9 12.3h0.01" strokeWidth={strokeWidth * 0.85} />
      </motion.g>
    </svg>
  );
}
