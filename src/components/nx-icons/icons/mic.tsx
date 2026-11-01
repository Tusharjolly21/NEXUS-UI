"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MicIconProps = {
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

/** A microphone that starts recording, with level bars bouncing inside and a red record light blinking. */
export function MicIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MicIconProps) {
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
      <path d="M12 3.3a3 3 0 0 0-3 3v5.4a3 3 0 0 0 6 0V6.3a3 3 0 0 0-3-3z" />
      <path d="M6.2 11a5.8 5.8 0 0 0 11.6 0M12 17v3.5M8.5 20.5h7" />
      {[6.6, 9, 11.4].map((y, i) => (
        <motion.path
          key={y}
          d={`M10.6 ${y}h2.8`}
          stroke={accent}
          strokeWidth={1.7}
          initial={false}
          animate={on ? { scaleX: [0.3, 1, 0.5, 1, 0.3] } : { scaleX: 0.3 }}
          transition={on ? { duration: 0.6 / speed, repeat: 1, delay: (i * 0.1) / speed, ease: "easeInOut" } : { duration: 0.2 / speed }}
        />
      ))}
      <motion.circle
        cx="18.6"
        cy="5.4"
        r="1.9"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { scale: [0, 1.3, 1, 1, 1, 1], opacity: [1, 1, 1, 0.25, 1, 0.25] } : { scale: 0, opacity: 1 }}
        transition={on ? { duration: 1.2 / speed, delay: (0.06) / speed, times: [0, 0.12, 0.2, 0.4, 0.6, 0.8] } : { duration: 0.1 / speed }}
      />
    </svg>
  );
}
