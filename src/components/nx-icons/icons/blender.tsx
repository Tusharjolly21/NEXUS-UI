"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BlenderIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #f43f5e. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The blade whirls fast inside the jar, shown edge on, while the whole blender shudders on its base. */
export function BlenderIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BlenderIconProps) {
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
      <path d="M12 18.65h0.01" />
      <rect x="6" y="15.8" width="12" height="5.7" rx="1.6" />
      <motion.g
        initial={false}
        animate={on ? { x: [0, 0.35, -0.35, 0.35, -0.35, 0.35, -0.35, 0] } : { x: 0 }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M9.6 11.6H14.4"
          stroke={accent}
          style={{ originX: "50%", originY: "48.33%" }}
          initial={false}
          animate={on ? { scaleX: [1, 0.12, 1, 0.12, 1, 0.12, 1, 0.12, 1, 0.12, 1, 0.12, 1] } : { scaleX: 1 }}
          transition={{ duration: 0.8 / speed, ease: "linear" }}
        />
        <path d="M5.6 5.7L18.4 5.7L16.31 14.87A1.2 1.2 0 0 1 15.14 15.8L8.86 15.8A1.2 1.2 0 0 1 7.69 14.87Z" />
        <path d="M7.8 5.7L8.4 2.5H15.6L16.2 5.7" />
      </motion.g>
    </svg>
  );
}
