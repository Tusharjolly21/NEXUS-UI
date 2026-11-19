"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type YenIconProps = {
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

/** The two bars slide out of the Y in opposite directions and glide back in from the far edges to settle on the stem. */
export function YenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: YenIconProps) {
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
      <path d="M6.6 4.6L12 11.6L17.4 4.6" />
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.path
          d="M7.9 13.69H16.1"
          stroke={accent}
          initial={false}
          animate={on ? { x: [0, 19, -19, 0.8, 0] } : { x: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.301, 0.72, 1], ease: ["easeIn", "linear", "easeOut", "easeInOut"] }}
        />
        <motion.path
          d="M7.9 16.79H16.1"
          stroke={accent}
          initial={false}
          animate={on ? { x: [0, 0, -19, 19, -0.8, 0] } : { x: 0 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.11, 0.38, 0.381, 0.78, 1], ease: ["linear", "easeIn", "linear", "easeOut", "easeInOut"] }}
        />
      </svg>
      <path d="M12 11.6V19.4" />
    </svg>
  );
}
