"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type QrCodeIconProps = {
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

/** Three finder squares and a cluster of data dots that pop in one after another as the code is read. */
export function QrCodeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: QrCodeIconProps) {
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
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
      <path d="M7 7h.01M17 7h.01M7 17h.01" strokeWidth={3} />
      {[
        { x: 14.5, y: 14.5 },
        { x: 18.5, y: 14.5 },
        { x: 16.5, y: 17.5 },
        { x: 14.5, y: 20.5 },
        { x: 20.5, y: 20.5 },
      ].map((p, i) => (
        <motion.path
          key={`${p.x}-${p.y}`}
          d={`M${p.x} ${p.y}h.01`}
          stroke={accent}
          strokeWidth={2.8}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 0.2, 1.5, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 / speed, delay: (i * 0.07) / speed, times: [0, 0.3, 0.7, 1] }}
        />
      ))}
    </svg>
  );
}
