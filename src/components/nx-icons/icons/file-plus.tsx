"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FilePlusIconProps = {
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

/** A document that lifts as its folded corner redraws, then a plus spins up out of nothing and pops into the page. */
export function FilePlusIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FilePlusIconProps) {
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
        initial={false}
        animate={on ? { y: [0, -1, 0] } : { y: 0 }}
        transition={{ duration: 0.6 / speed, ease: "easeInOut" }}
      >
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <motion.path
          d="M14 3v5h5"
          initial={false}
          animate={on ? { pathLength: [0, 1] } : { pathLength: 1 }}
          transition={{ duration: 0.35 / speed }}
        />
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [0, 1.3, 1], rotate: [-120, 0, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.55 / speed, delay: (on ? 0.2 : 0) / speed, times: [0, 0.65, 1], ease: "easeOut" }}
        >
          <path d="M12 12.4v5.2M9.4 15h5.2" stroke={accent} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
