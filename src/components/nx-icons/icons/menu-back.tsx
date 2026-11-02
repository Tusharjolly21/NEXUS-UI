"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MenuBackIconProps = {
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

/** A hamburger whose top and bottom lines swing down into the head of a left arrow while the middle line becomes its shaft. */
export function MenuBackIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MenuBackIconProps) {
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
        d="M4 12H20"
        initial={false}
        animate={{ d: on ? "M4.5 12H19.5" : "M4 12H20" }}
        transition={{ duration: 0.5 / speed, ease: [0.65, 0, 0.35, 1] }}
      />
      {[6.5, 17.5].flatMap((y, i) =>
        [0, 1].map((layer) => (
          <motion.path
            key={`${y}-${layer}`}
            d={`M4 ${y}H20`}
            stroke={layer ? accent : "currentColor"}
            style={{ originX: "0%", originY: "50%" }}
            initial={false}
            animate={{
              d: on ? `M4 ${y}H13.2` : `M4 ${y}H20`,
              x: on ? 0.5 : 0,
              y: on ? (i ? -5.5 : 5.5) : 0,
              rotate: on ? (i ? 45 : -45) : 0,
              opacity: layer ? (on ? 1 : 0) : 1,
            }}
            transition={{ duration: 0.5 / speed, ease: [0.65, 0, 0.35, 1] }}
          />
        ))
      )}
    </svg>
  );
}
