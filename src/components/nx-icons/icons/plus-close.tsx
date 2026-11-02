"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PlusCloseIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6b35. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A plus that spins an eighth of a turn and a half more with a small overshoot, settling into a coloured X. */
export function PlusCloseIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PlusCloseIconProps) {
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
      {[0, 1].map((layer) => (
        <motion.g
          key={layer}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={{ rotate: on ? 135 : 0, opacity: layer ? (on ? 1 : 0) : 1 }}
          transition={{ duration: 0.55 / speed, ease: [0.34, 1.4, 0.64, 1] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 4.5V19.5M4.5 12H19.5" stroke={layer ? accent : "currentColor"} />
        </motion.g>
      ))}
    </svg>
  );
}
