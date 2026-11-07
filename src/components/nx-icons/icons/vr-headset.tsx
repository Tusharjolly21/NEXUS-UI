"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VrHeadsetIconProps = {
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

/** The headset turns as if looking around while both lenses glow and send out a pulse. */
export function VrHeadsetIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VrHeadsetIconProps) {
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
        style={{ originX: "50%", originY: "58%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 4, -2, 0], scaleX: [1, 0.93, 1.02, 0.97, 1] } : { rotate: 0, scaleX: 1 }}
        transition={{ duration: 1 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M8.5 8.5C9 4.5 15 4.5 15.5 8.5" />
        <path d="M6 8.5H18A3.5 3.5 0 0 1 21.5 12V15A3.5 3.5 0 0 1 18 18.5H14.4C13.6 16.3 10.4 16.3 9.6 18.5H6A3.5 3.5 0 0 1 2.5 15V12A3.5 3.5 0 0 1 6 8.5Z" />
        {([7.6, 16.4] as number[]).map((lx) => (
          <g key={lx}>
            <motion.circle
              cx={lx}
              cy="13.5"
              r="2.3"
              stroke={accent}
              strokeWidth={1}
              style={{ originX: `${(lx / 24) * 100}%`, originY: "56.25%" }}
              initial={false}
              animate={on ? { scale: [1, 1.35, 1.35], opacity: [0.8, 0, 0] } : { scale: 1, opacity: 0 }}
              transition={{ duration: 0.6 / speed, delay: (0.2) / speed, ease: "easeOut" }}
            />
            <circle cx={lx} cy="13.5" r="2.3" stroke={accent} strokeWidth={1.5} />
            <motion.circle
              cx={lx}
              cy="13.5"
              r="0.9"
              fill={accent}
              stroke="none"
              style={{ originX: `${(lx / 24) * 100}%`, originY: "56.25%" }}
              initial={false}
              animate={on ? { scale: [1, 1.9, 1, 1.5, 1] } : { scale: 1 }}
              transition={{ duration: 0.8 / speed, delay: (0.15) / speed }}
            />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}
