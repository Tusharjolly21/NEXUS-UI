"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BathtubIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #38bdf8. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A drop swells at the tap, falls into the tub and sends a ripple across the water as the next drop forms. */
export function BathtubIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BathtubIconProps) {
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
      <g transform="translate(0 -0.12)">

      <path d="M3 11.5H21" />
      <path d="M4.5 11.5V13.5A5 5 0 0 0 9.5 18.5H14.5A5 5 0 0 0 19.5 13.5V11.5" />
      <path d="M7.5 18.08V20.6M16.5 18.08V20.6" />
      <path d="M4.5 11.5V5.6A2 2 0 0 1 6.5 3.6H9.4V5.4" />
      <motion.path
        d="M7.2 14.8H11.6"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        style={{ originX: "39.2%", originY: "61.7%" }}
        initial={false}
        animate={on ? { scaleX: [0, 0, 0.3, 1.1], opacity: [0, 0, 1, 0] } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.5, 0.58, 0.95], ease: "easeOut" }}
      />
      <motion.path
        d="M9.4 8.4h0.01"
        stroke={accent}
        style={{ originX: "39.2%", originY: "35%" }}
        initial={false}
        animate={on ? { y: [0, 0, 0, 6.4, 6.4, 0, 0], scale: [1, 1.35, 1.35, 1, 0.5, 0, 1], opacity: [1, 1, 1, 1, 0, 0, 1] } : { y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 1 / speed, times: [0, 0.14, 0.2, 0.5, 0.52, 0.62, 1], ease: "easeIn" }}
      />

      </g>
    </svg>
  );
}
