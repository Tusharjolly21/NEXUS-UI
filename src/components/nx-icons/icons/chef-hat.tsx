"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChefHatIconProps = {
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

/** A chef's hat that lifts and tips forward as the crown puffs up and a wisp of steam curls away. */
export function ChefHatIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChefHatIconProps) {
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
        style={{ originX: "50%", originY: "87%" }}
        initial={false}
        animate={on ? { rotate: [0, -9, -9, 0], y: [0, -0.6, -0.6, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.65, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.g
          style={{ originX: "50%", originY: "68%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1.07, 1.02, 1], scaleX: [1, 1.03, 1.01, 1] } : { scaleY: 1, scaleX: 1 }}
          transition={{ duration: 0.9 / speed, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M7 16.2V13A3 3 0 1 1 8.063 7.195A4 4 0 0 1 15.937 7.195A3 3 0 1 1 17 13V16.2" />
          <path d="M8.063 7.195V16.2M15.937 7.195V16.2" stroke={accent} />
        </motion.g>
        <path d="M7 16.2h10v2.9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z" />
      </motion.g>
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
        <motion.path
          d="M12 2.6c-1.2-.9 1.2-1.7 0-2.6"
          stroke={accent}
          strokeWidth={1.6}
          initial={false}
          animate={on ? { y: [2.6, -1.4], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
          transition={{ duration: 0.7 / speed, delay: (0.25) / speed, ease: "easeOut" }}
        />
      </svg>
    </svg>
  );
}
