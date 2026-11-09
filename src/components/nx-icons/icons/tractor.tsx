"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TractorIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A tractor that chugs forward in beats on turning wheels, puffing smoke from its exhaust. */
export function TractorIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TractorIconProps) {
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
        initial={false}
        animate={on ? { x: [0, 0.8, 0.5, 1.3, 1, 1.5, 0], y: [0, -0.3, 0, -0.3, 0, -0.3, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.12, 0.2, 0.3, 0.38, 0.48, 0.95], ease: "easeInOut" }}
      >
        <path d="M5.5 12.61V5.9a1 1 0 0 1 1-1H10.5a1 1 0 0 1 1 1V9.3H18.5a1.4 1.4 0 0 1 1.4 1.4V12.1a1.4 1.4 0 0 1-1.4 1.4H12.29" />
        <path d="M18.1 16.3V13.5" />
        <path d="M15.9 9.3V3.3" stroke={accent} />
        <circle cx="8.5" cy="16.1" r="4.6" />
        <motion.path
          d="M5.5 16.1H11.5M8.5 13.1V19.1"
          strokeWidth={strokeWidth * 0.5}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, 360] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, ease: "easeOut" }}
        />
        <circle cx="18.1" cy="18.5" r="2.2" />
        <motion.path
          d="M16.9 18.5H19.3"
          strokeWidth={strokeWidth * 0.5}
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, 720] } : { rotate: 0 }}
          transition={{ duration: 1 / speed, ease: "easeOut" }}
        />
        <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
          {([0.1, 0.28, 0.46] as number[]).map((dl) => (
            <motion.circle
              key={dl}
              cx="15.9"
              cy="3.3"
              r="1.2"
              fill="currentColor"
              stroke="none"
              style={{ originX: "50%", originY: "50%" }}
              initial={false}
              animate={on ? { x: [0, -4.4], y: [0, -2.4], scale: [0.4, 1.4], opacity: [0.55, 0] } : { opacity: 0 }}
              transition={{ duration: 0.5 / speed, delay: (on ? dl : 0) / speed, ease: "easeOut" }}
            />
          ))}
        </svg>
      </motion.g>
    </svg>
  );
}
