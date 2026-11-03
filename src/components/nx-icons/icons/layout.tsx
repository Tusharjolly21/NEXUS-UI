"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LayoutIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A window whose header drops in from the top, whose sidebar slides out from the left and whose content bars then draw in, building the page panel by panel. */
export function LayoutIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: LayoutIconProps) {
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
      <rect x="3" y="3.5" width="18" height="17" rx="2.6" />
      <motion.rect
        x="4"
        y="4.5"
        width="16"
        height="3.5"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "0%" }}
        initial={false}
        animate={on ? { scaleY: [0, 1, 1], fillOpacity: [0.3, 0.3, 0] } : { scaleY: 1, fillOpacity: 0 }}
        transition={{ duration: 0.75 / speed, times: [0, 0.45, 1], ease: "easeOut" }}
      />
      <motion.rect
        x="4.5"
        y="10"
        width="4"
        height="9.5"
        fill={accent}
        stroke="none"
        style={{ originX: "0%", originY: "50%" }}
        initial={false}
        animate={on ? { scaleX: [0, 0, 1, 1], fillOpacity: [0.3, 0.3, 0.3, 0] } : { scaleX: 1, fillOpacity: 0 }}
        transition={{ duration: 0.85 / speed, times: [0, 0.2, 0.6, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M3 9H21"
        initial={false}
        animate={on ? { y: [-4, 0] } : { y: 0 }}
        transition={{ duration: 0.34 / speed, ease: "easeOut" }}
      />
      <motion.path
        d="M9.5 9V20.5"
        initial={false}
        animate={on ? { x: [-5, 0] } : { x: 0 }}
        transition={{ duration: 0.4 / speed, delay: (0.16) / speed, ease: "easeOut" }}
      />
      {[
        { d: "M13.2 13.4h4.6", t: 0.5 },
        { d: "M13.2 17h2.6", t: 0.62 },
      ].map((b) => (
        <motion.path
          key={b.d}
          d={b.d}
          stroke={accent}
          initial={false}
          animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{ pathLength: { duration: 0.22 / speed, delay: (b.t) / speed }, opacity: { duration: 0.01 / speed, delay: (b.t) / speed } }}
        />
      ))}
    </svg>
  );
}
