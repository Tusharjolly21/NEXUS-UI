"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TramIconProps = {
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

/** A tram whose pantograph sparks race along the overhead wire while its headlights blink in turn. */
export function TramIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TramIconProps) {
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
      <path d="M3 2.6H21" />
      <path d="M9.4 6.6L12 2.6L14.6 6.6" strokeWidth={strokeWidth * 0.7} />
      <rect x="5" y="6.6" width="14" height="12" rx="3" />
      <rect x="8" y="9.6" width="8" height="3.8" rx="1.2" />
      <path d="M8.5 18.6V21.4M15.5 18.6V21.4M4.5 21.4H19.5" />
      {([[-1, 0], [1, 0], [-1, 0.34], [1, 0.34]] as [number, number][]).map(([d, dl]) => (
        <motion.path
          key={`${d}-${dl}`}
          d="M12 2.6h.01"
          stroke={accent}
          strokeWidth={3}
          initial={false}
          animate={on ? { x: [0, d * 6.6], opacity: [0, 1, 1, 0] } : { x: 0, opacity: 0 }}
          transition={{ duration: 0.42 / speed, delay: (on ? dl : 0) / speed, times: [0, 0.15, 0.7, 1], ease: "easeOut" }}
        />
      ))}
      <motion.path
        d="M8.5 16.1h.01"
        stroke={accent}
        strokeWidth={2.4}
        initial={false}
        animate={on ? { opacity: [1, 0.12, 1, 0.12, 1] } : { opacity: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.25, 0.5, 0.75, 1] }}
      />
      <motion.path
        d="M15.5 16.1h.01"
        stroke={accent}
        strokeWidth={2.4}
        initial={false}
        animate={on ? { opacity: [1, 0.12, 1, 0.12, 1] } : { opacity: 1 }}
        transition={{ duration: 0.8 / speed, delay: (0.2) / speed, times: [0, 0.25, 0.5, 0.75, 1] }}
      />
    </svg>
  );
}
