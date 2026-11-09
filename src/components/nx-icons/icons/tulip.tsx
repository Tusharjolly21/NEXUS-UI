"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TulipIconProps = {
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

/** A tulip whose outer petals swing open and close again around the centre petal. */
export function TulipIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TulipIconProps) {
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
      <path d="M12 14.3L12 20.9" />
      <path d="M12 20.9C11.33 17.55 8.48 15.28 5.2 15.5C5.73 18.74 8.59 21.01 12 20.9Z" />
      <path d="M12 20.9C15.41 21.01 18.27 18.74 18.8 15.5C15.52 15.28 12.67 17.55 12 20.9Z" />
      <motion.g
        style={{ originX: "50%", originY: "59.58%" }}
        initial={false}
        animate={on ? { rotate: [0, -24, -24, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.38, 0.58, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 14.3C9.6 13.5 8.9 10.9 9.2 8.3L6 5.1C4.8 9.1 7.6 14.3 12 14.3Z" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "59.58%" }}
        initial={false}
        animate={on ? { rotate: [0, 24, 24, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.38, 0.58, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 14.3C14.4 13.5 15.1 10.9 14.8 8.3L18 5.1C19.2 9.1 16.4 14.3 12 14.3Z" stroke={accent} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "59.58%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.08, 1.08, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.38, 0.58, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 14.3C9.6 13.5 8.9 10.9 9.2 8.3C9.5 6.3 10.8 4.3 12 3.1C13.2 4.3 14.5 6.3 14.8 8.3C15.1 10.9 14.4 13.5 12 14.3Z" stroke={accent} />
      </motion.g>
    </svg>
  );
}
