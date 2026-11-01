"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LaptopIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A laptop whose lid opens up and whose screen glows on. */
export function LaptopIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LaptopIconProps) {
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
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [0.2, 1.06, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      >
        <path d="M19.6 15.6V7.4a2 2 0 0 0-2-2H6.4a2 2 0 0 0-2 2v8.2" />
        <motion.rect
          x="7"
          y="8"
          width="10"
          height="5"
          rx="1"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { fillOpacity: [0, 0.2, 0.55, 0.3] } : { fillOpacity: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.4, 0.6, 1] }}
        />
      </motion.g>
      <path d="M3.6 15.8h16.8l1.3 2.6a1 1 0 0 1-.9 1.4H3.2a1 1 0 0 1-.9-1.4z" />
    </svg>
  );
}
