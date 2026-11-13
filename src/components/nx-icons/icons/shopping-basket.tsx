"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ShoppingBasketIconProps = {
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

/** A fruit drops through the handle into the basket, which squashes on the landing and springs back. */
export function ShoppingBasketIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ShoppingBasketIconProps) {
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
      <svg x="0" y="0" width="24" height="10.5" viewBox="0 0 24 10.5" overflow="hidden">
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [-12, 7.2, 7.2] } : { y: -12 }} transition={{ duration: 0.8 / speed, times: [0, 0.4, 1], ease: "easeIn" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <circle cx="12" cy="6.4" r="2.6" fill={accent} stroke="none" />
      </motion.g>
      </svg>
      <motion.g style={{ originX: "50%", originY: "85.42%" }} initial={false} animate={on ? { scaleY: [1, 1, 0.9, 1.04, 1], scaleX: [1, 1, 1.05, 0.98, 1] } : { scaleY: 1, scaleX: 1 }} transition={{ duration: 0.8 / speed, times: [0, 0.4, 0.5, 0.68, 1], ease: "easeOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M6.5 10.5C6.5 1.17 17.5 1.17 17.5 10.5"  />
      <path d="M4.5 10.5L6.2 20.5L17.8 20.5L19.5 10.5"  />
      <path d="M8.25 10.5L9.1 20.5"  />
      <path d="M12 10.5L12 20.5"  />
      <path d="M15.75 10.5L14.9 20.5"  />
      <path d="M3.5 10.5L20.5 10.5"  />
      </motion.g>
    </svg>
  );
}
