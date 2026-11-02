"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VolumeMuteIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A speaker whose two sound waves fold away, outer one first, while a coloured cross is drawn in where they were. */
export function VolumeMuteIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VolumeMuteIconProps) {
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
      <path d="M3.5 9.6a1 1 0 0 1 1-1h2.9l4.1-3.5a.7.7 0 0 1 1.1.5v12.8a.7.7 0 0 1-1.1.5l-4.1-3.5H4.5a1 1 0 0 1-1-1z" />
      {["M15.69 10.1a3.8 3.8 0 0 1 0 3.8", "M18.81 8.3a7.4 7.4 0 0 1 0 7.4"].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke={accent}
          initial={false}
          animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }}
          transition={{
            pathLength: { duration: 0.22 / speed, delay: (on ? i * 0.08 : 0.3 - i * 0.08) / speed, ease: "easeInOut" },
            opacity: { duration: 0.02 / speed, delay: (on ? 0.2 + i * 0.08 : 0) / speed },
          }}
        />
      ))}
      {["M15.6 9.6 20.4 14.4", "M20.4 9.6 15.6 14.4"].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke={accent}
          initial={false}
          animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
          transition={{
            pathLength: { duration: 0.22 / speed, delay: (on ? 0.2 + i * 0.1 : 0) / speed, ease: "easeOut" },
            opacity: { duration: 0.02 / speed, delay: (on ? 0.2 + i * 0.1 : 0.2) / speed },
          }}
        />
      ))}
    </svg>
  );
}
