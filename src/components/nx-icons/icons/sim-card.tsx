"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SimCardIconProps = {
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

/** A SIM card that slides out of its tray and clicks back in, its chip flashing. */
export function SimCardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SimCardIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, 7.5, -0.8, 0] } : { x: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.24, 0.7, 1], ease: ["easeIn", "easeOut", "easeInOut"] }}
        >
          <path d="M7.5 2.5h6l5 5v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2z" />
          <motion.g
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [1, 1, 1.22, 1] } : { scale: 1 }}
            transition={{ duration: 0.9 / speed, times: [0, 0.68, 0.78, 1] }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <rect x="8" y="8.5" width="8" height="7" rx="1.5" stroke={accent} strokeWidth={strokeWidth * 0.75} />
            <path d="M8 12h8M12 8.5v7" stroke={accent} strokeWidth={strokeWidth * 0.75} />
          </motion.g>
        </motion.g>
      </svg>
    </svg>
  );
}
