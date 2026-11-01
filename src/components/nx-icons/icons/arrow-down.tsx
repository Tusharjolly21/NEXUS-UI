"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ArrowDownIconProps = {
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

/** An arrow that drops onto a floor line with a little squash, and the floor flashes on impact. */
export function ArrowDownIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ArrowDownIconProps) {
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
        d="M5.5 21.2h13"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [1, 1, 1.3, 1], opacity: [0.7, 0.7, 1, 0.7] } : { scaleX: 1, opacity: 0.7 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.5, 0.6, 1], ease: "easeOut" }}
      />
      <motion.g
        initial={false}
        animate={on ? { y: [0, 2.2, 0] } : { y: 0 }}
        transition={{ duration: 0.6 / speed, times: [0, 0.5, 1], ease: ["easeIn", "easeOut"] }}
      >
        <path d="M12 4v13.5" />
        <path d="M6.5 12 12 17.5 17.5 12" />
      </motion.g>
    </svg>
  );
}
