"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MaximizeIconProps = {
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

/** Four corner brackets that push outward while a little square inside swells to fill the space. */
export function MaximizeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MaximizeIconProps) {
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
      <motion.rect
        x="10.2"
        y="10.2"
        width="3.6"
        height="3.6"
        rx="0.8"
        stroke={accent}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.9, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
      />
      {[
        { d: "M4 9V6a2 2 0 0 1 2-2h3", x: -1.8, y: -1.8 },
        { d: "M15 4h3a2 2 0 0 1 2 2v3", x: 1.8, y: -1.8 },
        { d: "M20 15v3a2 2 0 0 1-2 2h-3", x: 1.8, y: 1.8 },
        { d: "M9 20H6a2 2 0 0 1-2-2v-3", x: -1.8, y: 1.8 },
      ].map((c) => (
        <motion.path
          key={c.d}
          d={c.d}
          initial={false}
          animate={on ? { x: [0, c.x, 0], y: [0, c.y, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.5 / speed, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
