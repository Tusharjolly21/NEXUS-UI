"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FirstAidKitIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The lid of the case pops open on its hinge and settles shut while the cross pulses twice. */
export function FirstAidKitIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FirstAidKitIconProps) {
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
        style={{ originX: "87.5%", originY: "41.67%" }}
        initial={false}
        animate={on ? { rotate: [0, 16, 10, 14, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.5, 0.65, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M3 10V9.5A2.5 2.5 0 0 1 5.5 7H18.5A2.5 2.5 0 0 1 21 9.5V10" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4H13.5A1.5 1.5 0 0 1 15 5.5V7" />
      </motion.g>
      <path d="M3 10V17.5A2.5 2.5 0 0 0 5.5 20H18.5A2.5 2.5 0 0 0 21 17.5V10" />
      <motion.g
        style={{ originX: "50%", originY: "62.5%" }}
        initial={false}
        animate={on ? { scale: [1, 1.3, 1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.8 / speed, delay: (0.25) / speed, times: [0, 0.25, 0.5, 0.75, 1] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 12V18M9 15H15" stroke={accent} />
      </motion.g>
    </svg>
  );
}
