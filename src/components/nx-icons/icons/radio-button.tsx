"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RadioButtonIconProps = {
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

/** An empty ring that turns blue while a solid dot springs up inside it and a faint ripple fans out. */
export function RadioButtonIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: RadioButtonIconProps) {
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
      <circle cx="12" cy="12" r="8.5" />
      <motion.circle
        cx="12"
        cy="12"
        r="8.5"
        stroke={accent}
        initial={false}
        animate={{ opacity: on ? 1 : 0 }}
        transition={{ duration: 0.25 / speed }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="8.5"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.14], opacity: [0.5, 0] } : { opacity: 0 }}
        transition={{ duration: 0.5 / speed, delay: (0.1) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="4.2"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={on ? { scale: { type: "spring", stiffness: 420 * speed * speed, damping: 16 * speed }, opacity: { duration: 0.1 / speed } } : { duration: 0.2 / speed }}
      />
    </svg>
  );
}
