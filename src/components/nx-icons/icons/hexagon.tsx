"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HexagonIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffb800. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A hexagon that dips and turns a sixth of a turn, six corner dots lighting around it in sequence, an inner hexagon blooming from its centre. */
export function HexagonIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HexagonIconProps) {
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
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 60], scale: [1, 0.88, 1] } : { rotate: 0, scale: 1 }}
        transition={
          on
            ? { rotate: { duration: 0.8 / speed, ease: "easeInOut" }, scale: { duration: 0.8 / speed, times: [0, 0.5, 1], ease: "easeInOut" } }
            : { duration: 0 / speed }
        }
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M12 8.3 15.2 10.15v3.7L12 15.7 8.8 13.85v-3.7z"
          stroke={accent}
          strokeWidth={1.6}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [0.3, 1, 1.1], opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 0.7 / speed, times: [0, 0.5, 1], ease: "easeOut" }}
        />
        <path d="M12 3.1 19.71 7.55v8.9L12 20.9 4.29 16.45v-8.9z" />
        {[
          { x: 12, y: 3.1 },
          { x: 19.71, y: 7.55 },
          { x: 19.71, y: 16.45 },
          { x: 12, y: 20.9 },
          { x: 4.29, y: 16.45 },
          { x: 4.29, y: 7.55 },
        ].map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.5"
            fill={accent}
            stroke="none"
            style={{ originX: "50%", originY: "50%" }}
            initial={false}
            animate={on ? { scale: [0, 1.5, 0], opacity: [0, 1, 0] } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 / speed, delay: (0.2 + i * 0.09) / speed }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
