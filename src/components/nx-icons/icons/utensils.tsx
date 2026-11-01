"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UtensilsIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A fork and knife that lean together and clink, with a glint at the top. */
export function UtensilsIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UtensilsIconProps) {
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
        animate={on ? { rotate: [0, 8, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <path d="M5 3v5a3 3 0 0 0 6 0V3M8 3v5M8 11v10" />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <path d="M16.5 21V3c-2 1.4-2.8 3.9-2.8 7.2V14h2.8" stroke={accent} />
      </motion.g>
      <motion.path
        d="M12 1.8v2M11 2.8h2"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 0, 1, 0], scale: [0.5, 0.5, 1.2, 1] } : { opacity: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.6 / speed, times: [0, 0.35, 0.5, 1] }}
      />
    </svg>
  );
}
