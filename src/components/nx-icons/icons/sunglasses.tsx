"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SunglassesIconProps = {
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

/** The tinted shades slide down the nose a little, a bright glint sweeps across both lenses, then they are nudged back up. */
export function SunglassesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SunglassesIconProps) {
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
        animate={on ? { y: [0, 1.4, 1.4, -0.25, 0] } : { y: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.25, 0.68, 0.86, 1], ease: "easeInOut" }}
      >
        <path d="M4 9.7 H9 a1.5 1.5 0 0 1 1.5 1.5 V13.45 a3.75 3.75 0 0 1 -3.75 3.75 H6.25 a3.75 3.75 0 0 1 -3.75 -3.75 V11.2 a1.5 1.5 0 0 1 1.5 -1.5 Z" fill={accent} fillOpacity={0.45} stroke="none" />
        <path d="M4 9.7 H9 a1.5 1.5 0 0 1 1.5 1.5 V13.45 a3.75 3.75 0 0 1 -3.75 3.75 H6.25 a3.75 3.75 0 0 1 -3.75 -3.75 V11.2 a1.5 1.5 0 0 1 1.5 -1.5 Z" fill={accent} fillOpacity={0.45} stroke="none" transform="translate(24 0) scale(-1 1)" />

        <svg x="3.5" y="10.7" width="6" height="5.5" viewBox="3.5 10.7 6 5.5" overflow="hidden">
          <motion.g
            initial={false}
            animate={on ? { x: [0, 0, 28, 0] } : { x: 0 }}
            transition={{ duration: 1.1 / speed, times: [0, 0.25, 0.74, 0.741], ease: "easeInOut" }}
          >
            <path d="M-1 9.7 L-5 18.5" stroke="#fff" strokeOpacity={0.9} strokeWidth={2.5} /><path d="M2.6 9.7 L-1.4 18.5" stroke="#fff" strokeOpacity={0.9} strokeWidth={1} />
          </motion.g>
        </svg>

        <svg x="14.5" y="10.7" width="6" height="5.5" viewBox="14.5 10.7 6 5.5" overflow="hidden">
          <motion.g
            initial={false}
            animate={on ? { x: [0, 0, 28, 0] } : { x: 0 }}
            transition={{ duration: 1.1 / speed, times: [0, 0.25, 0.74, 0.741], ease: "easeInOut" }}
          >
            <path d="M-1 9.7 L-5 18.5" stroke="#fff" strokeOpacity={0.9} strokeWidth={2.5} /><path d="M2.6 9.7 L-1.4 18.5" stroke="#fff" strokeOpacity={0.9} strokeWidth={1} />
          </motion.g>
        </svg>
        <path d="M4 9.7 H9 a1.5 1.5 0 0 1 1.5 1.5 V13.45 a3.75 3.75 0 0 1 -3.75 3.75 H6.25 a3.75 3.75 0 0 1 -3.75 -3.75 V11.2 a1.5 1.5 0 0 1 1.5 -1.5 Z" />
        <path d="M4 9.7 H9 a1.5 1.5 0 0 1 1.5 1.5 V13.45 a3.75 3.75 0 0 1 -3.75 3.75 H6.25 a3.75 3.75 0 0 1 -3.75 -3.75 V11.2 a1.5 1.5 0 0 1 1.5 -1.5 Z" transform="translate(24 0) scale(-1 1)" />
        <path d="M10.5 11.2 Q12 8.4 13.5 11.2" />
        <path d="M3 9.9 L2.5 6.7" />
        <path d="M3 9.9 L2.5 6.7" transform="translate(24 0) scale(-1 1)" />
      </motion.g>
    </svg>
  );
}
