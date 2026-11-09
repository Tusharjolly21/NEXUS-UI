"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RadiationIconProps = {
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

/** The three blades turn exactly a third of a turn round the hub, winding back a touch first, while the hub pulses. */
export function RadiationIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RadiationIconProps) {
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
      <circle cx="12" cy="12" r="9.5" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -12, 120] } : { rotate: 0 }}
        transition={on ? { duration: 0.9 / speed, times: [0, 0.2, 1], ease: "easeInOut" } : { duration: 0 / speed }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g fill={accent} stroke={accent} strokeWidth={strokeWidth * 0.5}>
          {[0, 120, 240].map((a) => (
            <path key={a} d="M10.2 8.88L8.35 5.68A7.3 7.3 0 0 1 15.65 5.68L13.8 8.88A3.6 3.6 0 0 0 10.2 8.88z" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
      </motion.g>
      <motion.circle
        cx="12"
        cy="12"
        r="1.6"
        fill="currentColor"
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.7, 1.5, 1] } : { scale: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.7, 1] }}
      />
    </svg>
  );
}
