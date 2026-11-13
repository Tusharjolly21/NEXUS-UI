"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type KiteIconProps = {
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

/** The kite tilts and swings in a gust while its tail with two bows swings after it. */
export function KiteIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: KiteIconProps) {
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
      <g transform="translate(0 0.27)">
      <motion.g
        style={{ originX: "12px", originY: "15px" }}
        initial={false}
        animate={on ? { rotate: [0, -9, 7, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.g
          style={{ originX: "12px", originY: "15px" }}
          initial={false}
          animate={on ? { rotate: [0, 12, -10, 0] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 17.4L9.8 16.5V18.3z M12 17.4L14.2 16.5V18.3z" fill={accent} stroke="none" />
          <path d="M12 19.8L9.8 18.9V20.7z M12 19.8L14.2 18.9V20.7z" fill={accent} stroke="none" />
          <path d="M12 15V21.2" strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <path d="M12 2.5V15M6.5 8H17.5" stroke={accent} />
        <path d="M12 2.5L17.5 8L12 15L6.5 8z" />
      </motion.g>
      </g>
    </svg>
  );
}
