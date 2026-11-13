"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FishingRodIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A fishing rod that flexes as the bobber is tugged under and pops back up in the ripples. */
export function FishingRodIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FishingRodIconProps) {
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
<g transform="translate(-0.39 0.21)">
      <motion.path
        d="M13.4 3.6C17.8 4.5 19 7.98 19 12.98"
        strokeLinecap="butt"
        initial={false}
        animate={on ? { d: ["M13.4 3.6C17.8 4.5 19 7.98 19 12.98", "M14.3 5C18.7 5.9 19 9.98 19 14.98", "M13 2.9C17.4 3.8 19 7.08 19 12.08", "M13.7 4.1C18.1 5 19 8.58 19 13.58", "M13.4 3.6C17.8 4.5 19 7.98 19 12.98"] } : { d: "M13.4 3.6C17.8 4.5 19 7.98 19 12.98" }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M3.6 20C6.6 15.6 10 9.8 13.4 3.6"
        initial={false}
        animate={on ? { d: ["M3.6 20C6.6 15.6 10 9.8 13.4 3.6", "M3.6 20C6.73 15.81 10.45 10.5 14.3 5", "M3.6 20C6.54 15.49 9.8 9.45 13 2.9", "M3.6 20C6.64 15.67 10.15 10.05 13.7 4.1", "M3.6 20C6.6 15.6 10 9.8 13.4 3.6"] } : { d: "M3.6 20C6.6 15.6 10 9.8 13.4 3.6" }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
      <circle cx="7.44" cy="17.41" r="1.8" />
      <motion.circle
        cx="19"
        cy="14.6"
        r="1.9"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 2, -0.9, 0.6, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M13.4 16.4q1.3-1.2 2.6 0t2.6 0t2.6 0"
        initial={false}
        animate={on ? { d: ["M13.4 16.4q1.3-1.2 2.6 0t2.6 0t2.6 0", "M13.4 16.4q1.3 1.2 2.6 0t2.6 0t2.6 0", "M13.4 16.4q1.3-1.2 2.6 0t2.6 0t2.6 0", "M13.4 16.4q1.3 1.2 2.6 0t2.6 0t2.6 0", "M13.4 16.4q1.3-1.2 2.6 0t2.6 0t2.6 0"] } : { d: "M13.4 16.4q1.3-1.2 2.6 0t2.6 0t2.6 0" }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
</g>
    </svg>
  );
}
