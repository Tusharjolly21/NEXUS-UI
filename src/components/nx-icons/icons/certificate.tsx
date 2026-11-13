"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CertificateIconProps = {
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

/** Two lines are written onto the certificate, then a red seal with ribbon tails stamps down over its border. */
export function CertificateIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CertificateIconProps) {
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
      <motion.path
        d="M7.5 8.5H10.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.25 / speed, ease: "easeOut", opacity: { duration: 0.01 / speed } }}
      />
      <motion.path
        d="M7.5 11.5H10.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.25 / speed, delay: (on ? 0.14 : 0) / speed, ease: "easeOut", opacity: { duration: 0.01 / speed, delay: (on ? 0.14 : 0) / speed } }}
      />
      <motion.g
        style={{ originX: "62.5%", originY: "53.75%" }}
        initial={false}
        animate={on ? { scale: [1.3, 0.92, 1.05, 1], opacity: [0, 1, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.35 : 0) / speed, times: [0, 0.5, 0.75, 1], ease: "easeOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M13.7 14.2L12.2 21M16.3 14.2L17.8 21" stroke={accent} />
      </motion.g>
      <rect x="2.5" y="3" width="19" height="14" rx="2" />
      <rect x="5" y="5.5" width="14" height="9" rx="1" strokeWidth={strokeWidth * 0.75} />
      <motion.circle
        cx="15"
        cy="12.9"
        r="2.5"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1.3, 0.92, 1.05, 1], opacity: [0, 1, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.35 : 0) / speed, times: [0, 0.5, 0.75, 1], ease: "easeOut" }}
      />
    </svg>
  );
}
