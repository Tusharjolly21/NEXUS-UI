"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PliersIconProps = {
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

/** Pliers whose crossed handles squeeze together so the jaws clamp shut, then release. */
export function PliersIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PliersIconProps) {
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
          style={{ originX: "50%", originY: "49.79%" }}
          initial={false}
          animate={on ? { rotate: [0, -6, -6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.5, 0.85], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12.9 2.35 L14.3 2.35 L16.8 8.15 L15.2 9.55 L12.9 9.35z" fill="currentColor" strokeWidth={1.2} />
          <path d="M13.56 10.13 L14.4 9.15" />
          <path d="M11.1 14.18 L8.4 20.85" />
          <path d="M10.35 16.03 L8.4 20.85" stroke={accent} strokeWidth={2.8} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "49.79%" }}
          initial={false}
          animate={on ? { rotate: [0, 6, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.5, 0.85], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M11.1 2.35 L9.7 2.35 L7.2 8.15 L8.8 9.55 L11.1 9.35z" fill="currentColor" strokeWidth={1.2} />
          <path d="M10.44 10.13 L9.6 9.15" />
          <path d="M12.9 14.18 L15.6 20.85" />
          <path d="M13.65 16.03 L15.6 20.85" stroke={accent} strokeWidth={2.8} />
        </motion.g>
        <path d="M9.6 11.95 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0z M11.1 11.95 a0.9 0.9 0 1 1 1.8 0 a0.9 0.9 0 1 1 -1.8 0z" fill="currentColor" fillRule="evenodd" stroke="none" />
    </svg>
  );
}
