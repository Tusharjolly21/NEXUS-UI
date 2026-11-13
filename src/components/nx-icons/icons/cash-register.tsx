"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CashRegisterIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #f2a100. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A till whose keys are tapped in turn, then the drawer shoots open with a jolt of the whole register. */
export function CashRegisterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CashRegisterIconProps) {
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
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, 0, -1.4, 0] } : { y: 0 }} transition={{ duration: 0.6 / speed, times: [0, 0.5, 0.65, 1], ease: "easeInOut", delay: (0.45) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M8 8V4A1.2 1.2 0 0 1 9.2 2.8H14.8A1.2 1.2 0 0 1 16 4V8"  />
      <path d="M10.4 5.4L13.6 5.4" strokeWidth={strokeWidth * 0.75} stroke={accent} />
      <path d="M3.5 14.6V9.5A1.5 1.5 0 0 1 5 8H19A1.5 1.5 0 0 1 20.5 9.5V14.6Z"  />
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, 1, 0] } : { y: 0 }} transition={{ duration: 0.2 / speed, ease: "easeInOut", delay: (0.1) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M8 11.3h.01"  />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, 1, 0] } : { y: 0 }} transition={{ duration: 0.2 / speed, ease: "easeInOut", delay: (0.2) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M12 11.3h.01"  />
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, 1, 0] } : { y: 0 }} transition={{ duration: 0.2 / speed, ease: "easeInOut", delay: (0.3) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M16 11.3h.01"  />
      </motion.g>
      </motion.g>
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={on ? { y: [0, 0, 1, 0] } : { y: 0 }} transition={{ duration: 0.6 / speed, times: [0, 0.5, 0.65, 1], ease: "easeInOut", delay: (0.45) / speed }}>
      <rect width="24" height="24" fill="none" stroke="none" />
      <path d="M3.5 14.6V19.7A1.5 1.5 0 0 0 5 21.2H19A1.5 1.5 0 0 0 20.5 19.7V14.6Z"  />
      <path d="M10 17.9L14 17.9"  />
      </motion.g>
    </svg>
  );
}
