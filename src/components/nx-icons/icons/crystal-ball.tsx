"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CrystalBallIconProps = {
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

/** The star inside the crystal ball spins and twinkles while a glint sweeps over the glass. */
export function CrystalBallIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CrystalBallIconProps) {
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
      <circle cx="12" cy="10" r="7.5" />
      <path d="M9.2 17.5H14.8L16.6 21.5H7.4z" />
      <motion.path
        d="M7.46 8.16A4.9 4.9 0 0 1 9.93 5.56"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5 / speed, delay: (0.5) / speed }}
      />
      <motion.path
        d="M12 6.6Q12.8 9.2 15.4 10Q12.8 10.8 12 13.4Q11.2 10.8 8.6 10Q11.2 9.2 12 6.6z"
        fill={accent}
        stroke={accent}
        strokeWidth={1}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 90], scale: [1, 0.4, 1.3, 1] } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.35, 0.75, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
