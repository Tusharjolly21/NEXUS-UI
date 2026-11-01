"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type GiftIconProps = {
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

/** A gift box whose lid pops off with a bow, showering the air with confetti. */
export function GiftIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: GiftIconProps) {
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
      <rect x="4.5" y="11" width="15" height="9.5" rx="1.6" />
      <path d="M12 11v9.5" stroke={accent} />
      <motion.g
        initial={false}
        animate={on ? { y: [0, -4, 0], rotate: [0, -6, 0] } : { y: 0, rotate: 0 }}
        style={{ originX: "50%", originY: "100%" }}
        transition={{ duration: 0.55 / speed, times: [0, 0.35, 1], ease: "easeOut", delay: (on ? 0.1 : 0) / speed }}
      >
        <rect x="3.5" y="7.5" width="17" height="3.5" rx="1.2" />
        <path d="M12 7.5c-1.4-3.2-4.8-3.6-4.8-1.6S10.6 7.7 12 7.5zM12 7.5c1.4-3.2 4.8-3.6 4.8-1.6S13.4 7.7 12 7.5z" stroke={accent} />
      </motion.g>
      {[
        { x: -7, y: -7, r: 40, w: 1.6 },
        { x: -3.4, y: -9, r: -60, w: 1.2 },
        { x: 0.4, y: -10, r: 90, w: 1.5 },
        { x: 3.6, y: -8.6, r: -30, w: 1.2 },
        { x: 7, y: -6.6, r: 70, w: 1.6 },
      ].map((p, i) => (
        <motion.rect
          key={i}
          x={11.2}
          y={6}
          width={p.w}
          height={p.w * 1.8}
          rx="0.3"
          fill={accent}
          stroke="none"
          initial={false}
          animate={on ? { x: [0, p.x], y: [0, p.y, p.y + 3], rotate: [0, p.r], opacity: [0, 1, 0] } : { x: 0, y: 0, opacity: 0 }}
          transition={on ? { duration: 0.7 / speed, delay: (0.15 + i * 0.02) / speed, ease: "easeOut" } : { duration: 0.1 / speed }}
        />
      ))}
    </svg>
  );
}
