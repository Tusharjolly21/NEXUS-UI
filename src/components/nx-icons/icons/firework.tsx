"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FireworkIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The burst pulls in to a spark, then explodes outward again while its sparkles fly out and pop into place. */
export function FireworkIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FireworkIconProps) {
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
      <motion.path
        d="M12 8.4L12 5M14.55 9.45L16.95 7.05M15.6 12L19 12M14.55 14.55L16.95 16.95M12 15.6L12 19M9.45 14.55L7.05 16.95M8.4 12L5 12M9.45 9.45L7.05 7.05"
        initial={false}
        animate={on ? { d: ["M12 8.4L12 5M14.55 9.45L16.95 7.05M15.6 12L19 12M14.55 14.55L16.95 16.95M12 15.6L12 19M9.45 14.55L7.05 16.95M8.4 12L5 12M9.45 9.45L7.05 7.05", "M12 5.8L12 4.4M16.38 7.62L17.37 6.63M18.2 12L19.6 12M16.38 16.38L17.37 17.37M12 18.2L12 19.6M7.62 16.38L6.63 17.37M5.8 12L4.4 12M7.62 7.62L6.63 6.63", "M12 11.1L12 10.5M12.64 11.36L13.06 10.94M12.9 12L13.5 12M12.64 12.64L13.06 13.06M12 12.9L12 13.5M11.36 12.64L10.94 13.06M11.1 12L10.5 12M11.36 11.36L10.94 10.94", "M12 7.6L12 3.8M15.11 8.89L17.8 6.2M16.4 12L20.2 12M15.11 15.11L17.8 17.8M12 16.4L12 20.2M8.89 15.11L6.2 17.8M7.6 12L3.8 12M8.89 8.89L6.2 6.2", "M12 8.6L12 5.2M14.4 9.6L16.81 7.19M15.4 12L18.8 12M14.4 14.4L16.81 16.81M12 15.4L12 18.8M9.6 14.4L7.19 16.81M8.6 12L5.2 12M9.6 9.6L7.19 7.19", "M12 8.4L12 5M14.55 9.45L16.95 7.05M15.6 12L19 12M14.55 14.55L16.95 16.95M12 15.6L12 19M9.45 14.55L7.05 16.95M8.4 12L5 12M9.45 9.45L7.05 7.05"], opacity: [1, 0, 1, 1, 1, 1] } : { d: "M12 8.4L12 5M14.55 9.45L16.95 7.05M15.6 12L19 12M14.55 14.55L16.95 16.95M12 15.6L12 19M9.45 14.55L7.05 16.95M8.4 12L5 12M9.45 9.45L7.05 7.05", opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.18, 0.24, 0.44, 0.66, 1], ease: "easeOut" }}
      />
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, -2.91, -2.91, 0.34, 0], y: [0, 0, 7.02, 7.02, -0.83, 0], scale: [1, 0, 0, 0.6, 1.35, 1], opacity: [1, 0, 0, 1, 1, 1] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.18, 0.2, 0.3, 0.6, 1], ease: "easeOut" }}
        >
          <circle cx="15.52" cy="3.5" r="0.95" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, -7.02, -7.02, 0.83, 0], y: [0, 0, 2.91, 2.91, -0.34, 0], scale: [1, 0, 0, 0.6, 1.35, 1], opacity: [1, 0, 0, 1, 1, 1] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.18, 0.2, 0.3, 0.6, 1], ease: "easeOut" }}
        >
          <circle cx="20.5" cy="8.48" r="0.95" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, -7.02, -7.02, 0.83, 0], y: [0, 0, -2.91, -2.91, 0.34, 0], scale: [1, 0, 0, 0.6, 1.35, 1], opacity: [1, 0, 0, 1, 1, 1] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.18, 0.2, 0.3, 0.6, 1], ease: "easeOut" }}
        >
          <circle cx="20.5" cy="15.52" r="0.95" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, -2.91, -2.91, 0.34, 0], y: [0, 0, -7.02, -7.02, 0.83, 0], scale: [1, 0, 0, 0.6, 1.35, 1], opacity: [1, 0, 0, 1, 1, 1] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.18, 0.2, 0.3, 0.6, 1], ease: "easeOut" }}
        >
          <circle cx="15.52" cy="20.5" r="0.95" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, 2.91, 2.91, -0.34, 0], y: [0, 0, -7.02, -7.02, 0.83, 0], scale: [1, 0, 0, 0.6, 1.35, 1], opacity: [1, 0, 0, 1, 1, 1] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.18, 0.2, 0.3, 0.6, 1], ease: "easeOut" }}
        >
          <circle cx="8.48" cy="20.5" r="0.95" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, 7.02, 7.02, -0.83, 0], y: [0, 0, -2.91, -2.91, 0.34, 0], scale: [1, 0, 0, 0.6, 1.35, 1], opacity: [1, 0, 0, 1, 1, 1] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.18, 0.2, 0.3, 0.6, 1], ease: "easeOut" }}
        >
          <circle cx="3.5" cy="15.52" r="0.95" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, 7.02, 7.02, -0.83, 0], y: [0, 0, 2.91, 2.91, -0.34, 0], scale: [1, 0, 0, 0.6, 1.35, 1], opacity: [1, 0, 0, 1, 1, 1] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.18, 0.2, 0.3, 0.6, 1], ease: "easeOut" }}
        >
          <circle cx="3.5" cy="8.48" r="0.95" fill={accent} stroke="none" />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, 2.91, 2.91, -0.34, 0], y: [0, 0, 7.02, 7.02, -0.83, 0], scale: [1, 0, 0, 0.6, 1.35, 1], opacity: [1, 0, 0, 1, 1, 1] } : { x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.18, 0.2, 0.3, 0.6, 1], ease: "easeOut" }}
        >
          <circle cx="8.48" cy="3.5" r="0.95" fill={accent} stroke="none" />
        </motion.g>
    </svg>
  );
}
