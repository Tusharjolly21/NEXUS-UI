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

/** A shark that glides forward, its tail sweeping while its dorsal fin cuts the water and leaves a wake. */
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
        animate={on ? { x: [0, 1.3, 1.3, 0] } : { x: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
      >
        <motion.g
          style={{ originX: "26.25%", originY: "54.29%" }}
          initial={false}
          animate={on ? { rotate: [0, 13, -13, 9, -6, 0] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M6.3 13.03C5.5 10.43 4.1 7.43 2.2 4.63Q2.1 9.43 4.5 13.03Q2.3 16.63 2.7 20.03C4.5 18.23 5.9 15.63 6.3 13.03Z" fill="currentColor" strokeWidth={1} />
        </motion.g>
        <path d="M15.3 17.8C14.2 19.73 12.4 20.83 10.7 21.33Q10.9 19.73 11.9 17.88Z" fill="currentColor" strokeWidth={1} />
        <path d="M14.9 8.63C13.3 6.23 11.9 4.23 10.5 2.73C10.1 4.63 9.7 6.83 9.1 9.48Z" fill={accent} stroke={accent} strokeWidth={1} />
        <path d="M21.3 12.53C19.3 9.63 16.3 8.43 12.3 8.43C9.5 8.43 7.9 10.23 6.3 13.03C7.9 16.03 10.3 18.03 13.3 18.03C16.5 18.03 19.1 16.43 21.3 12.53Z" />
        <motion.path
          d="M8.5 5.03h-2.4M8.3 7.33h-2.4"
          stroke={accent}
          strokeWidth={1.3}
          initial={false}
          animate={on ? { x: [0, -1.3, -1.3, 0], opacity: [0, 1, 1, 0] } : { x: 0, opacity: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
        />
        <path d="M9.7 10.73Q10.6 12.83 9.7 14.93M12.1 10.73Q13 12.83 12.1 14.93" strokeWidth={1.3} />
        <path d="M18.5 14.03Q15.9 14.73 13.1 14.33" strokeWidth={1.3} />
        <path d="M16.6 14.43L18.2 14.43L17.4 15.83ZM14.6 14.58L16.2 14.58L15.4 15.98ZM12.7 14.48L14.3 14.48L13.5 15.88Z" fill="currentColor" stroke="none" />
        <circle cx="17.1" cy="11.73" r="0.9" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
