"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CloudRainIconProps = {
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

/** A rain cloud with three blue drops that fall in turn, again and again. */
export function CloudRainIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CloudRainIconProps) {
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
      <motion.path
        d="M7 14.8a3.8 3.8 0 0 1-.5-7.5A5.2 5.2 0 0 1 16.6 8.5a3.3 3.3 0 0 1 .6 6.3z"
        initial={false}
        animate={on ? { y: [0, -0.6, 0] } : { y: 0 }}
        transition={on ? { duration: 0.55 / speed, repeat: 2, ease: "easeInOut" } : { duration: 0.2 / speed }}
      />
      {[8.6, 12, 15.4].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 17.2v2.2`}
          stroke={accent}
          initial={false}
          animate={on ? { y: [0, 3], opacity: [0, 1, 0] } : { y: 0, opacity: 1 }}
          transition={on ? { duration: 0.55 / speed, ease: "easeIn", repeat: 2, delay: (i * 0.18) / speed } : { duration: 0.2 / speed }}
        />
      ))}
    </svg>
  );
}
