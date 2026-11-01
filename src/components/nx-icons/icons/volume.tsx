"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VolumeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A speaker whose cone pumps while sound waves roll out of it, twice. */
export function VolumeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VolumeIconProps) {
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
        style={{ originX: "20%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={on ? { duration: 0.3 / speed, repeat: 2, ease: "easeOut" } : { duration: 0.2 / speed }}
      >
        <path d="M4.5 9.8h3l4.2-3.6a.6.6 0 0 1 1 .45v10.7a.6.6 0 0 1-1 .45L7.5 14.2h-3a1 1 0 0 1-1-1v-2.4a1 1 0 0 1 1-1z" />
      </motion.g>
      {["M15.6 9.2a4 4 0 0 1 0 5.6", "M18.2 6.6a7.6 7.6 0 0 1 0 10.8"].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0.25, 1, 0.25], x: [0, 1.2, 0] } : { opacity: 1, x: 0 }}
          transition={on ? { duration: 0.5 / speed, delay: (0.1 + i * 0.2) / speed, repeat: 1 } : { duration: 0.2 / speed }}
        />
      ))}
    </svg>
  );
}
