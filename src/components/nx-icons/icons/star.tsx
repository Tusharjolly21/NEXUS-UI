"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type StarIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A star that spins a full turn while it fills with gold and throws off three sparkles. */
export function StarIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: StarIconProps) {
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
      <motion.path
        d="M12 3.4l2.5 5.3 5.8.8-4.2 4 1 5.8L12 16.6l-5.1 2.7 1-5.8-4.2-4 5.8-.8z"
        fill={accent}
        style={{ originX: "50%", originY: "55%" }}
        initial={false}
        animate={on ? { rotate: [0, 360], scale: [1, 1.3, 1], fillOpacity: 1 } : { rotate: 0, scale: 1, fillOpacity: 0 }}
        transition={{ rotate: { duration: 0.9 / speed, ease: "easeInOut" }, scale: { duration: 0.9 / speed, ease: "easeInOut" }, fillOpacity: { duration: 0.3 / speed } }}
      />
      {[
        { x: 20.4, y: 3.8, d: 0.45 },
        { x: 3.6, y: 6.4, d: 0.55 },
        { x: 20.6, y: 19.2, d: 0.65 },
      ].map((s) => (
        <motion.path
          key={s.x}
          d={`M${s.x} ${s.y - 1.5}v3M${s.x - 1.5} ${s.y}h3`}
          stroke={accent}
          strokeWidth={1.5}
          initial={false}
          animate={on ? { scale: [0, 1.2, 0], rotate: [0, 0, 45], opacity: [0, 1, 0] } : { scale: 0, opacity: 0 }}
          transition={on ? { duration: 0.5 / speed, delay: (s.d) / speed } : { duration: 0.1 / speed }}
        />
      ))}
    </svg>
  );
}
