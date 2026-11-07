"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WaveformIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** Seven audio bars that swell and shrink in a wave rolling from left to right. */
export function WaveformIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WaveformIconProps) {
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
      <motion.path
        d="M3 9V15"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.7, 0.4, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.55 / speed, delay: (0) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M6 5.5V18.5"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.62, 0.4, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.55 / speed, delay: (0.07) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M9 8V16"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.7, 0.4, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.55 / speed, delay: (0.14) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M12 2.5V21.5"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.11, 0.4, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.55 / speed, delay: (0.21) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M15 6.5V17.5"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.7, 0.4, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.55 / speed, delay: (0.28) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M18 4.5V19.5"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.4, 0.4, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.55 / speed, delay: (0.35) / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M21 9.5V14.5"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleY: [1, 1.7, 0.4, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.55 / speed, delay: (0.42) / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
