"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PizzaIconProps = {
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

/** A pizza slice that sways while its toppings pop on one by one. */
export function PizzaIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PizzaIconProps) {
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
      <g transform="translate(0 -0.75)">
      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 4, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.7 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 20.8 3.9 6.9a16 16 0 0 1 16.2 0z" />
        {[
          { x: 9, y: 9.6 },
          { x: 14.8, y: 9.6 },
          { x: 12, y: 14.2 },
        ].map((t, i) => (
          <motion.circle
            key={`${t.x}-${t.y}`}
            cx={t.x}
            cy={t.y}
            r="1.1"
            fill={accent}
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [1, 1.9, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 / speed, delay: (0.1 + i * 0.1) / speed }}
          />
        ))}
      </motion.g>
      </g>
    </svg>
  );
}
