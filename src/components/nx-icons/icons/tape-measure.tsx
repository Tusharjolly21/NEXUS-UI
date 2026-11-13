"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TapeMeasureIconProps = {
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

/** The tape snaps back into its case, then pulls out smoothly until the hook reaches full length. */
export function TapeMeasureIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TapeMeasureIconProps) {
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
      <svg x="13.5" y="0" width="10.5" height="24" viewBox="13.5 0 10.5 24" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, -6, -6, 0] } : { x: 0 }}
          transition={{ duration: 1 / speed, times: [0, 0.2, 0.34, 1], ease: ["easeIn", "linear", "easeOut"] }}
        >
          <rect x="13.5" y="9.5" width="8" height="5" fill={accent} stroke="none" />
          <path d="M15.25 9.5V11.25A0.75 0.75 0 0 0 16.75 11.25V9.5ZM17.75 9.5V11.25A0.75 0.75 0 0 0 19.25 11.25V9.5Z" fill="currentColor" stroke="none" />
          <path d="M21.5 7.5V16.5" />
        </motion.g>
      </svg>
      <rect x="2.5" y="5.5" width="11" height="13" rx="3.5" />
      <motion.circle
        cx="8"
        cy="12"
        r="2.4"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, -180, -180, 360] } : { rotate: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.2, 0.34, 1], ease: ["easeIn", "linear", "easeOut"] }}
      />
    </svg>
  );
}
