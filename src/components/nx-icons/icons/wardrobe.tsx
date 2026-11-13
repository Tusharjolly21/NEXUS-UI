"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WardrobeIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #f59e0b. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Both doors fold open toward their hinges to show clothes hanging inside, then swing shut again. */
export function WardrobeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WardrobeIconProps) {
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
      <path d="M7 19.3V21.3M17 19.3V21.3" />
      <motion.g
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.15, 0.4, 0.7, 0.9] }}
      >
        <path d="M9 6.2H15M12 6.2V8.6" />
        <path d="M10.33 9.12A0.6 0.6 0 0 1 10.93 8.6L13.07 8.6A0.6 0.6 0 0 1 13.67 9.12L14.46 15.27A1 1 0 0 1 13.46 16.4L10.54 16.4A1 1 0 0 1 9.54 15.27Z" />
      </motion.g>
      <motion.path
        d="M12 2.5L6 2.5A1.5 1.5 0 0 0 4.5 4L4.5 17.8A1.5 1.5 0 0 0 6 19.3L12 19.3Z"
        initial={false}
        animate={on ? { d: ["M12 2.5L6 2.5A1.5 1.5 0 0 0 4.5 4L4.5 17.8A1.5 1.5 0 0 0 6 19.3L12 19.3Z", "M6.8 2.5L6 2.5A1.5 1.5 0 0 0 4.5 4L4.5 17.8A1.5 1.5 0 0 0 6 19.3L6.8 19.3Z", "M6.8 2.5L6 2.5A1.5 1.5 0 0 0 4.5 4L4.5 17.8A1.5 1.5 0 0 0 6 19.3L6.8 19.3Z", "M12 2.5L6 2.5A1.5 1.5 0 0 0 4.5 4L4.5 17.8A1.5 1.5 0 0 0 6 19.3L12 19.3Z"] } : { d: "M12 2.5L6 2.5A1.5 1.5 0 0 0 4.5 4L4.5 17.8A1.5 1.5 0 0 0 6 19.3L12 19.3Z" }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.66, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M12 2.5L18 2.5A1.5 1.5 0 0 1 19.5 4L19.5 17.8A1.5 1.5 0 0 1 18 19.3L12 19.3Z"
        initial={false}
        animate={on ? { d: ["M12 2.5L18 2.5A1.5 1.5 0 0 1 19.5 4L19.5 17.8A1.5 1.5 0 0 1 18 19.3L12 19.3Z", "M17.2 2.5L18 2.5A1.5 1.5 0 0 1 19.5 4L19.5 17.8A1.5 1.5 0 0 1 18 19.3L17.2 19.3Z", "M17.2 2.5L18 2.5A1.5 1.5 0 0 1 19.5 4L19.5 17.8A1.5 1.5 0 0 1 18 19.3L17.2 19.3Z", "M12 2.5L18 2.5A1.5 1.5 0 0 1 19.5 4L19.5 17.8A1.5 1.5 0 0 1 18 19.3L12 19.3Z"] } : { d: "M12 2.5L18 2.5A1.5 1.5 0 0 1 19.5 4L19.5 17.8A1.5 1.5 0 0 1 18 19.3L12 19.3Z" }}
        transition={{ duration: 1 / speed, times: [0, 0.4, 0.66, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M9.2 9V12.6M14.8 9V12.6"
        initial={false}
        animate={on ? { opacity: [1, 0, 0, 1] } : { opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.8, 1] }}
      />
    </svg>
  );
}
