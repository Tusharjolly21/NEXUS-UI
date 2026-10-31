"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MoonIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A crescent moon that rocks gently while two stars twinkle on, like a lullaby. */
export function MoonIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MoonIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
        animate={on ? { rotate: [0, -14, 8, -4, 0] } : { rotate: 0 }}
        transition={{ duration: 1.4 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M20.2 14.2A8.4 8.4 0 1 1 9.8 3.8a6.6 6.6 0 0 0 10.4 10.4z" />
      </motion.g>
      {[
        { x: 17.6, y: 4.6, d: 0.38 },
        { x: 21, y: 9.4, d: 0.63 },
      ].map((s) => (
        <motion.path
          key={s.x}
          d={`M${s.x} ${s.y - 1.7}v3.4M${s.x - 1.7} ${s.y}h3.4`}
          stroke={accent}
          strokeWidth={1.5}
          initial={false}
          animate={on ? { scale: [0, 1.3, 0.8], rotate: [0, 0, 45], opacity: [0, 1, 1] } : { scale: 0, opacity: 0 }}
          transition={on ? { duration: 0.5 / speed, delay: (s.d) / speed } : { duration: 0.1 / speed }}
        />
      ))}
    </svg>
  );
}
