"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type VolleyballIconProps = {
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

/** A volleyball that is set upward, spins a full turn while it squashes and stretches, then settles. */
export function VolleyballIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: VolleyballIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
      <motion.g
        initial={false}
        animate={on ? { y: [0, -1.2, 0.4, 0], scaleY: [1, 0.92, 1.05, 1, 0.93, 1], scaleX: [1, 1.06, 0.97, 1, 1.07, 1] } : { y: 0, scaleX: 1, scaleY: 1 }}
        transition={{ y: { duration: 0.9 / speed, times: [0, 0.34, 0.72, 1], ease: ["easeOut", "easeIn", "easeOut"] }, scaleY: { duration: 0.9 / speed, times: [0, 0.1, 0.34, 0.66, 0.74, 1], ease: "easeInOut" }, scaleX: { duration: 0.9 / speed, times: [0, 0.1, 0.34, 0.66, 0.74, 1], ease: "easeInOut" } }}
        style={{ originX: "50%", originY: "100%" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, 360] } : { rotate: 360 }}
          transition={{ duration: 0.85 / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="12" cy="12" r="9.2" fill={accent} fillOpacity={0.25} />
          <path d="M12 10.2 Q14.25 8.1 21.16 12.8M13.56 12.9 Q14.25 15.9 6.72 19.54M10.44 12.9 Q7.5 12 8.11 3.66" strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </motion.g>
      </svg>
    </svg>
  );
}
