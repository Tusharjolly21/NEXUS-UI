"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SyringeIconProps = {
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

/** The plunger pushes in, the liquid level drops and a drop leaves the needle before the plunger eases back. */
export function SyringeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SyringeIconProps) {
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
      <g transform="translate(-0.55 0.55) rotate(-45 12 12)">
        <motion.rect
          x="5"
          y="9"
          width="6.6"
          height="6"
          fill={accent}
          fillOpacity="0.32"
          stroke="none"
          style={{ originX: "0%", originY: "50%" }}
          initial={false}
          animate={on ? { scaleX: [1, 0.61, 0.61, 1] } : { scaleX: 1 }}
          transition={{ duration: 1.2 / speed, times: [0, 0.38, 0.6, 1], ease: "easeInOut" }}
        />
        <g strokeWidth={strokeWidth * 0.5}><path d="M7 9V11.2" /><path d="M8.8 9V11.2" /><path d="M10.6 9V11.2" /></g>
        <motion.g
          initial={false}
          animate={on ? { x: [0, -2.6, -2.6, 0] } : { x: 0 }}
          transition={{ duration: 1.2 / speed, times: [0, 0.38, 0.6, 1], ease: "easeInOut" }}
        >
          <path d="M11.6 10.75V13.25M11.6 12H21.6" strokeWidth={strokeWidth * 0.75} />
          <path d="M21.6 8.4V15.6" />
        </motion.g>
        <rect x="5" y="9" width="11.2" height="6" rx="1" />
        <path d="M16.2 7V17" />
        <path d="M5 12H-0.2" strokeWidth={strokeWidth * 0.75} />
      </g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.circle
          cx="2.82"
          cy="22.08"
          r="1.1"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { y: [0, 4], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.6 / speed, delay: (on ? 0.4 : 0) / speed, ease: "easeIn" }}
        />
      </svg>
    </svg>
  );
}
