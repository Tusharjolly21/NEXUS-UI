"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type NewspaperIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A newspaper is thrown in from the left, spinning flat and landing with a small bounce. */
export function NewspaperIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: NewspaperIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
      <g transform="translate(0.25 0.12)">
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { x: [0, -26, -26, 1.4, -0.5, 0], rotate: [0, -30, -30, 4, -1.5, 0] } : { x: 0, rotate: 0 }} transition={{ duration: 1 / speed, times: [0, 0.14, 0.2, 0.6, 0.8, 1], ease: "easeOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M7 3.5H18.5A2 2 0 0 1 20.5 5.5V18.2A2 2 0 0 1 18.5 20.2H5.5A2.5 2.5 0 0 1 3 17.7V10.5A2.5 2.5 0 0 1 5.5 8H7Z"  />
      <path d="M7 8L7 20.2"  />
      <path d="M10.2 12L17.3 12"  /><path d="M10.2 16L14.6 16"  />
      <path d="M10.2 8L17.3 8" stroke={accent} />
      </motion.g>
      </g>
      </svg>
    </svg>
  );
}
