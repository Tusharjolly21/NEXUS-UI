"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GamepadIconProps = {
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

/** A game controller whose d-pad and buttons press one after another. */
export function GamepadIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GamepadIconProps) {
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
      <path d="M7 8.5h10a4.5 4.5 0 0 1 4.4 5.3l-.7 3.4a2.4 2.4 0 0 1-4 1.2l-1.8-1.9H9.1l-1.8 1.9a2.4 2.4 0 0 1-4-1.2l-.7-3.4A4.5 4.5 0 0 1 7 8.5z" />
      <motion.path
        d="M8 11.8v3.2M6.4 13.4h3.2"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.78, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 / speed, delay: (0.05) / speed }}
      />
      {[
        { x: 15.4, y: 12.4, d: 0.25 },
        { x: 17.6, y: 14.4, d: 0.4 },
      ].map((b) => (
        <motion.circle
          key={b.d}
          cx={b.x}
          cy={b.y}
          r="1"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 0.55, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 / speed, delay: (b.d) / speed }}
        />
      ))}
    </svg>
  );
}
