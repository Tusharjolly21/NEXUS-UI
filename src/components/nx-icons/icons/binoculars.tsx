"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BinocularsIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The focus wheel between the barrels turns, its ridge rolling across, while a glint sweeps over each lens in turn. */
export function BinocularsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BinocularsIconProps) {
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
      <path d="M8.596 6.5 H15.404 M9.635 12.5 H14.365" stroke={accent} strokeLinecap="butt" />
      <svg x="10.5" y="7.5" width="3" height="4" viewBox="10.5 7.5 3 4" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { x: [0, 0, -4, 0] } : { x: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.01, 0.999, 1], ease: "easeInOut" }}
        >
          <g stroke={accent} strokeWidth={strokeWidth * 0.75}>
            <path d="M8 7.5V11.5" strokeLinecap="butt" /><path d="M12 7.5V11.5" strokeLinecap="butt" /><path d="M16 7.5V11.5" strokeLinecap="butt" />
          </g>
        </motion.g>
      </svg>
      <path d="M4.75 4.5 H8.25 L10.5 17.5 a2 2 0 0 1 -2 2 H4.5 a2 2 0 0 1 -2 -2 Z" />
      <path d="M4.75 4.5 H8.25 L10.5 17.5 a2 2 0 0 1 -2 2 H4.5 a2 2 0 0 1 -2 -2 Z" transform="translate(24 0) scale(-1 1)" />
      <motion.path
        d="M5.11 13.4 L4.452 17.2"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [1, 0.05, 1], opacity: [1, 0.3, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45 / speed, delay: (0.1) / speed, times: [0, 0.35, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M5.11 13.4 L4.452 17.2"
        transform="translate(24 0) scale(-1 1)"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [1, 0.05, 1], opacity: [1, 0.3, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45 / speed, delay: (0.3) / speed, times: [0, 0.35, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
