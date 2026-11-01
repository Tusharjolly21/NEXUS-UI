"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MenuIconProps = {
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

/** Three lines that shorten and slide in a quick wave, the middle one in colour. */
export function MenuIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MenuIconProps) {
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
      {[6.5, 12, 17.5].map((y, i) => (
        <motion.path
          key={y}
          d={`M4 ${y}h16`}
          stroke={i === 1 ? accent : "currentColor"}
          style={{ originX: "0%", originY: "50%" }}
          initial={false}
          animate={on ? { scaleX: [1, 0.5, 1], x: [0, 2, 0] } : { scaleX: 1, x: 0 }}
          transition={{ duration: 0.45 / speed, ease: "easeInOut", delay: (i * 0.08) / speed }}
        />
      ))}
    </svg>
  );
}
