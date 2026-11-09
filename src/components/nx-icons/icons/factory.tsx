"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FactoryIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ac8e68. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A sawtooth factory whose two chimneys puff smoke that rises and fades in turn. */
export function FactoryIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FactoryIconProps) {
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
      <path d="M3 21.08V8.68H7V15.08L14 11.08V15.08L21 11.08V21.08Z" />
      <path d="M6 18.08h.01 M10 18.08h.01 M14 18.08h.01 M18 18.08h.01" strokeWidth={2.2} />
      <motion.circle
        cx="5"
        cy="2.88"
        r="0.95"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, -1.3, 0, 0], scale: [1, 1.3, 0.3, 1], opacity: [1, 0, 0, 1] } : { y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 / speed, delay: (0) / speed, times: [0, 0.45, 0.55, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="5"
        cy="5.58"
        r="1.1"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, -2, 0, 0], scale: [1, 1.3, 0.3, 1], opacity: [1, 0, 0, 1] } : { y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 / speed, delay: (0.25) / speed, times: [0, 0.45, 0.55, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
