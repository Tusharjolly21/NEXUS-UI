"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BarrierGateIconProps = {
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

/** A striped boom barrier whose long arm lifts about its hinge on the post while the counterweight dips behind it, holds, then lowers back across the road. */
export function BarrierGateIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BarrierGateIconProps) {
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
        style={{ originX: "40.083%", originY: "45.417%" }}
        initial={false}
        animate={on ? { rotate: [0, -24, -24, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, ease: "easeInOut", times: [0, 0.38, 0.58, 0.88, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3.72 9.6 H2.42 A0.8 0.8 0 0 0 1.62 10.4 V11.4 A0.8 0.8 0 0 0 2.42 12.2 H3.72Z" fill="currentColor" stroke="none" />
      </motion.g>
      <path d="M4.02 17.5 L4.02 7.9 A1.4 1.4 0 0 1 5.42 6.5 L8.22 6.5 A1.4 1.4 0 0 1 9.62 7.9 L9.62 17.5" />
      <path d="M2.82 17.5 H10.82" />
      <circle cx="9.62" cy="10.9" r="2.6" fill="currentColor" stroke="none" />
      <motion.g
        style={{ originX: "40.083%", originY: "45.417%" }}
        initial={false}
        animate={on ? { rotate: [0, -24, -24, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, ease: "easeInOut", times: [0, 0.38, 0.58, 0.88, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <g fill={accent} stroke="none"><path d="M11.42 9.4 L12.462 9.4 L14.862 12.4 L11.42 12.4Z" /><path d="M13.903 9.4 L15.345 9.4 L17.745 12.4 L16.303 12.4Z" /><path d="M16.787 9.4 L18.228 9.4 L20.628 12.4 L19.187 12.4Z" /></g>
        <path d="M10.923 9.4 H20.62 A1 1 0 0 1 21.62 10.4 V11.4 A1 1 0 0 1 20.62 12.4 H10.923" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
    </svg>
  );
}
