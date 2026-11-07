"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AppWindowIconProps = {
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

/** The three title bar dots light in turn while the picture block and text lines build into the frame. */
export function AppWindowIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: AppWindowIconProps) {
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
      <rect x="2.5" y="3.5" width="19" height="17" rx="3" />
      <path d="M2.5 8.5H21.5" />
      <path d="M6.2 6h.01M9 6h.01M11.8 6h.01" strokeWidth={1.8} />
      {([6.2, 9, 11.8] as number[]).map((dx, i) => (
        <motion.path
          key={dx}
          d={`M${dx} 6h.01`}
          stroke={accent}
          strokeWidth={1.8}
          initial={false}
          animate={on ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.45 / speed, delay: (i * 0.14) / speed, times: [0, 0.2, 0.6, 1] }}
        />
      ))}
      <motion.rect
        x="5.5"
        y="11.75"
        width="5"
        height="5.5"
        rx="1.2"
        fill={accent}
        stroke="none"
        style={{ originX: "33.33%", originY: "60.42%" }}
        initial={false}
        animate={on ? { scale: [0, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 / speed, delay: (0.3) / speed, times: [0, 0.7, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M13.5 12.75H17.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.35 / speed, delay: (0.45) / speed, times: [0, 0.1, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M13.5 16.25H16"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.35 / speed, delay: (0.6) / speed, times: [0, 0.1, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
