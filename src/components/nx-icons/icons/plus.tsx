"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PlusIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A plus that spins a quarter turn with a pop and a ring of green. */
export function PlusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PlusIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [0.5, 1.2], opacity: [0.8, 0] } : { opacity: 0, scale: 0.5 }}
        transition={on ? { duration: 0.5 / speed, delay: (0.1) / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
      />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 90], scale: [1, 1.18, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 5.5v13M5.5 12h13" />
      </motion.g>
    </svg>
  );
}
