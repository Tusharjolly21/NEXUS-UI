"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SitemapIconProps = {
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

/** A tree of boxes that builds downward: the root pulses, the trunk and branches draw out, and the child boxes drop in one by one. */
export function SitemapIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SitemapIconProps) {
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
        d="M12 7.5v9"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.3 / speed, delay: (on ? 0.12 : 0) / speed, ease: "easeOut" },
          opacity: { duration: 0.3 / speed, delay: (on ? 0.12 : 0) / speed, times: [0, 0.05, 1] },
        }}
      />
      <motion.path
        d="M12 12H5v4.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.3 / speed, delay: (on ? 0.35 : 0) / speed, ease: "easeOut" },
          opacity: { duration: 0.3 / speed, delay: (on ? 0.35 : 0) / speed, times: [0, 0.05, 1] },
        }}
      />
      <motion.path
        d="M12 12h7v4.5"
        initial={false}
        animate={on ? { pathLength: [0, 1], opacity: [0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.3 / speed, delay: (on ? 0.35 : 0) / speed, ease: "easeOut" },
          opacity: { duration: 0.3 / speed, delay: (on ? 0.35 : 0) / speed, times: [0, 0.05, 1] },
        }}
      />
      <motion.rect
        x="9"
        y="3"
        width="6"
        height="4.5"
        rx="1.2"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 0.8, 1.15, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.45 / speed, times: [0, 0.3, 0.65, 1], ease: "easeOut" }}
      />
      {[3, 10, 17].map((x, i) => (
        <motion.rect
          key={x}
          x={x}
          y="16.5"
          width="4"
          height="4.5"
          rx="1"
          initial={false}
          animate={on ? { y: [-4, 0], scale: [0.5, 1.15, 1], opacity: [0, 1, 1] } : { y: 0, scale: 1, opacity: 1 }}
          style={{ originX: "50%", originY: "50%" }}
          transition={{ duration: 0.35 / speed, delay: (on ? 0.6 + i * 0.09 : 0) / speed, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
