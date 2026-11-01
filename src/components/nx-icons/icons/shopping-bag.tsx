"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ShoppingBagIconProps = {
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

/** A shopping bag that sways with its handle lifting, and a little smile appearing on the front. */
export function ShoppingBagIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ShoppingBagIconProps) {
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
      <motion.g
        style={{ originX: "50%", originY: "12%" }}
        initial={false}
        animate={on ? { rotate: [0, -8, 6, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <path d="M5 8h14l-1 12.2a1.6 1.6 0 0 1-1.6 1.4H7.6A1.6 1.6 0 0 1 6 20.2z" />
        <motion.path
          d="M9 8V6.5a3 3 0 0 1 6 0V8"
          stroke={accent}
          initial={false}
          animate={on ? { y: [0, -1.4, 0] } : { y: 0 }}
          transition={{ duration: 0.5 / speed, ease: "easeOut" }}
        />
        <motion.path
          d="M9.6 13.4a2.4 2.4 0 0 0 4.8 0"
          stroke={accent}
          initial={false}
          animate={on ? { opacity: [0, 1], scale: [0.6, 1] } : { opacity: 0 }}
          transition={{ duration: 0.3 / speed, delay: (on ? 0.3 : 0) / speed }}
        />
      </motion.g>
    </svg>
  );
}
