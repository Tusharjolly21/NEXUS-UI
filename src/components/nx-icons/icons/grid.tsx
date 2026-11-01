"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GridIconProps = {
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

/** Four tiles that pop one after another, the first in colour. */
export function GridIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GridIconProps) {
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
      {[
        { x: 3, y: 3 },
        { x: 14, y: 3 },
        { x: 14, y: 14 },
        { x: 3, y: 14 },
      ].map((r, i) => (
        <motion.rect
          key={`${r.x}-${r.y}`}
          x={r.x}
          y={r.y}
          width="7"
          height="7"
          rx="1.6"
          stroke={i === 0 ? accent : "currentColor"}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.14, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 / speed, delay: (i * 0.08) / speed, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
