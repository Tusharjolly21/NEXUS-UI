"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ShoppingCartIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A cart that rolls forward as an item drops in. */
export function ShoppingCartIcon({ size = 24, strokeWidth = 2, className, play }: ShoppingCartIconProps) {
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
        initial={false}
        animate={on ? { x: [0, 0, 1.4, 0], y: [0, 0, 0.8, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.7, times: [0, 0.4, 0.55, 1], ease: "easeInOut" }}
      >
        <path d="M2.5 3.5h2.6l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1l1.4-6.2H6" />
        <circle cx="9.5" cy="19.3" r="1.4" />
        <circle cx="17" cy="19.3" r="1.4" />
        <motion.rect
          x="10.2"
          y="9"
          width="3.6"
          height="3.6"
          rx="0.9"
          fill="currentColor"
          stroke="none"
          initial={false}
          animate={on ? { y: [-9, 0], opacity: [0, 1] } : { y: -9, opacity: 0 }}
          transition={{ duration: on ? 0.4 : 0.15, ease: "easeIn" }}
        />
      </motion.g>
    </svg>
  );
}
