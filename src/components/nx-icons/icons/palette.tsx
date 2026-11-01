"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PaletteIconProps = {
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

/** A paint palette whose dabs of colour pop one after another. */
export function PaletteIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PaletteIconProps) {
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
      <path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-.6-.3-1-.6-1.4-.3-.4-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H18a3 3 0 0 0 3-3C21 6.4 17 3 12 3z" />
      {[
        { x: 7.6, y: 11.2 },
        { x: 10.2, y: 7.4 },
        { x: 14.8, y: 7.4 },
      ].map((d, i) => (
        <motion.circle
          key={`${d.x}-${d.y}`}
          cx={d.x}
          cy={d.y}
          r="1.1"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1.8, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 / speed, delay: (i * 0.12) / speed }}
        />
      ))}
    </svg>
  );
}
