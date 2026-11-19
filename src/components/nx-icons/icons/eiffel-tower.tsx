"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type EiffelTowerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffcc00. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Three golden sparkles twinkle one after another around the tower, like its lights at the top of the hour. */
export function EiffelTowerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: EiffelTowerIconProps) {
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
        d="M5.6 4.9Q5.91 6.29 7.3 6.6Q5.91 6.91 5.6 8.3Q5.29 6.91 3.9 6.6Q5.29 6.29 5.6 4.9Z"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0, 1.15, 0], opacity: [0, 1, 0], rotate: [0, 45, 90] } : { scale: 0, opacity: 0, rotate: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0) / speed, times: [0, 0.45, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M18.6 8.2Q18.85 9.35 20 9.6Q18.85 9.85 18.6 11Q18.35 9.85 17.2 9.6Q18.35 9.35 18.6 8.2Z"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0, 1.15, 0], opacity: [0, 1, 0], rotate: [0, 45, 90] } : { scale: 0, opacity: 0, rotate: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.18) / speed, times: [0, 0.45, 1], ease: "easeInOut" }}
      />
      <motion.path
        d="M5.9 13.35Q6.12 14.38 7.15 14.6Q6.12 14.82 5.9 15.85Q5.68 14.82 4.65 14.6Q5.68 14.38 5.9 13.35Z"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0, 1.15, 0], opacity: [0, 1, 0], rotate: [0, 45, 90] } : { scale: 0, opacity: 0, rotate: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.36) / speed, times: [0, 0.45, 1], ease: "easeInOut" }}
      />
      <path d="M5.4 21.3Q11.15 15.4 12 5.4Q12.85 15.4 18.6 21.3" />
      <path d="M12 2.6V5.4" />
      <path d="M10.02 9.9H13.98M8.48 14H15.52" />
      <path d="M6.73 19.8Q12 14.2 17.27 19.8" />
    </svg>
  );
}
