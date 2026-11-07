"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ToolboxIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The lid of a toolbox pops open, a hammer and a wrench rise out of the gap, and then everything drops back and the lid shuts. */
export function ToolboxIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ToolboxIconProps) {
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
      <svg x="0" y="0" width="24" height="13" viewBox="0 0 24 13" overflow="hidden">
        <motion.g
          initial={false}
          animate={on ? { y: [8, -0.7, -0.7, 8] } : { y: 8 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.3, 0.68, 0.92], ease: "easeInOut" }}
        >
          <path d="M14.6 19V10.8" />
          <path d="M13.3 10.1H15.9" strokeWidth={2.8} />
        </motion.g>
        <motion.g
          initial={false}
          animate={on ? { y: [8, 8, 0, 0, 8] } : { y: 8 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.14, 0.4, 0.72, 0.95], ease: "easeInOut" }}
        >
          <path d="M19.2 19V8.8M17.6 6.8V8.8H20.8V6.8" stroke={accent} />
        </motion.g>
      </svg>
      <path d="M3 13h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M10.5 13v2.6h3V13" stroke={accent} />
      <motion.g
        style={{ originX: "12.5%", originY: "54.17%" }}
        initial={false}
        animate={on ? { rotate: [0, -32, -29, -29, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.26, 0.38, 0.72, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3 13V11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2z" />
        <path d="M8.5 9V6.6a1.4 1.4 0 0 1 1.4-1.4h4.2a1.4 1.4 0 0 1 1.4 1.4V9" />
      </motion.g>
      </svg>
    </svg>
  );
}
