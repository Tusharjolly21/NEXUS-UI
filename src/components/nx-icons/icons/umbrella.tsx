"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type UmbrellaIconProps = {
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

/** An umbrella that pops open with a spring while raindrops fall past it. */
export function UmbrellaIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: UmbrellaIconProps) {
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
        animate={on ? { scaleY: [0.35, 1.1, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      >
        <path d="M22 12a10.06 10.06 0 0 0-20 0Z" />
      </motion.g>
      <path d="M12 12v8a2 2 0 0 0 4 0" />
      <path d="M12 2v1" />
      {[3.5, 21].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 15v2`}
          stroke={accent}
          initial={false}
          animate={on ? { y: [-2, 4], opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.5 / speed, delay: (0.3 + i * 0.12) / speed, repeat: 1 }}
        />
      ))}
    </svg>
  );
}
