"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TriangleIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6a3d. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A triangle that shrinks a little and turns a third of a turn, its three corners lighting up in turn as they pass, before settling back into place. */
export function TriangleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TriangleIconProps) {
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
        style={{ originX: "50%", originY: "60.7%" }}
        initial={false}
        animate={on ? { rotate: [0, 120], scale: [1, 0.72, 1] } : { rotate: 0, scale: 1 }}
        transition={
          on
            ? { rotate: { duration: 0.85 / speed, ease: "easeInOut" }, scale: { duration: 0.85 / speed, times: [0, 0.5, 1], ease: "easeInOut" } }
            : { duration: 0 / speed }
        }
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 4.4 3.2 19.64h17.6z" />
        {[
          { x: 12, y: 4.4 },
          { x: 20.8, y: 19.64 },
          { x: 3.2, y: 19.64 },
        ].map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.6"
            fill={accent}
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [0, 1.5, 0], opacity: [0, 1, 0] } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.34 / speed, delay: (0.3 + i * 0.16) / speed }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
