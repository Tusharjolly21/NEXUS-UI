"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AmericanFootballIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A football that spins a full turn while it is lobbed in a short arc and settles back. */
export function AmericanFootballIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AmericanFootballIconProps) {
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
        animate={on ? { y: [0, -1.1, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.5, 1], ease: ["easeOut", "easeIn"] }}
      >
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, 360], scale: [1, 0.92, 1] } : { rotate: 360, scale: 1 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <g transform="rotate(-45 12 12)">
            <path d="M2 12A11.73 11.73 0 0 1 22 12A11.73 11.73 0 0 1 2 12z" />
            <path d="M6.8 7.62V16.38M17.2 7.62V16.38" />
            <path d="M8.7 12H15.3M9.4 10.3V13.7M12 10.3V13.7M14.6 10.3V13.7" stroke={accent} strokeWidth={strokeWidth * 0.75} />
          </g>
        </motion.g>
      </motion.g>
    </svg>
  );
}
