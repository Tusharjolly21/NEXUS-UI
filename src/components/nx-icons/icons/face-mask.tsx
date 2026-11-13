"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FaceMaskIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #64d2ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The ear loops stretch outward and snap back as the mask bounces and its pleats open. */
export function FaceMaskIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FaceMaskIconProps) {
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
      <motion.g style={{ originX: "27.08%", originY: "50%" }} initial={false} animate={on ? { scaleX: [1, 1.2, 1, 1] } : { scaleX: 1 }} transition={{ duration: 0.7 / speed, times: [0, 0.3, 0.45, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M6.5 9.9C1.9 9.9 1.9 14.1 6.5 14.1"  />
      </motion.g>
      <motion.g style={{ originX: "72.92%", originY: "50%" }} initial={false} animate={on ? { scaleX: [1, 1.2, 1, 1] } : { scaleX: 1 }} transition={{ duration: 0.7 / speed, times: [0, 0.3, 0.45, 1], ease: "easeInOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M17.5 9.9C22.1 9.9 22.1 14.1 17.5 14.1"  />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { scale: [1, 1, 1.06, 1] } : { scale: 1 }} transition={{ duration: 0.7 / speed, times: [0, 0.3, 0.45, 1], ease: "easeOut" }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, -0.5, 0] } : { y: 0 }} transition={{ duration: 0.5 / speed, ease: "easeInOut", delay: (0.3) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M6.5 10L17.5 10" strokeWidth={strokeWidth * 0.6} stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, 0, 0] } : { y: 0 }} transition={{ duration: 0.5 / speed, ease: "easeInOut", delay: (0.3) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M6.5 12L17.5 12" strokeWidth={strokeWidth * 0.6} stroke={accent} />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, 0.5, 0] } : { y: 0 }} transition={{ duration: 0.5 / speed, ease: "easeInOut", delay: (0.3) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M6.5 14L17.5 14" strokeWidth={strokeWidth * 0.6} stroke={accent} />
      </motion.g>
      <path d="M6.5 9.4Q12 5.4 17.5 9.4V14.6Q12 18.6 6.5 14.6Z"  />
      </motion.g>
    </svg>
  );
}
