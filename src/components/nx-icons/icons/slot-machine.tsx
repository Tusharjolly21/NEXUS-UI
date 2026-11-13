"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SlotMachineIconProps = {
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

/** The lever is pulled, three reels blur past and stop one after another. */
export function SlotMachineIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SlotMachineIconProps) {
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
      <rect x="2.6" y="3" width="15.4" height="18" rx="2.5" />
      <rect x="5" y="6.8" width="10.6" height="7.6" rx="1" strokeWidth={strokeWidth * 0.75} />
      <motion.circle
        cx="6.9"
        cy="10.6"
        r="1.2"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 2, -2, 0, 2, -2, 0, 2, -2, 0.35, -0.15, 0], opacity: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.66 / speed, delay: (0.15) / speed, times: [0, 0.1364, 0.1379, 0.2273, 0.3182, 0.3197, 0.4091, 0.5, 0.5015, 0.7576, 0.8636, 1], ease: "linear" }}
      />
      <motion.circle
        cx="10.3"
        cy="10.6"
        r="1.2"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 2, -2, 0, 2, -2, 0, 2, -2, 0, 2, -2, 0.35, -0.15, 0], opacity: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.78 / speed, delay: (0.15) / speed, times: [0, 0.1154, 0.1167, 0.1923, 0.2692, 0.2705, 0.3462, 0.4231, 0.4244, 0.5, 0.5769, 0.5782, 0.7949, 0.8846, 1], ease: "linear" }}
      />
      <motion.circle
        cx="13.7"
        cy="10.6"
        r="1.2"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 2, -2, 0, 2, -2, 0, 2, -2, 0, 2, -2, 0, 2, -2, 0.35, -0.15, 0], opacity: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.9 / speed, delay: (0.15) / speed, times: [0, 0.1, 0.1011, 0.1667, 0.2333, 0.2344, 0.3, 0.3667, 0.3678, 0.4333, 0.5, 0.5011, 0.5667, 0.6333, 0.6344, 0.8222, 0.9, 1], ease: "linear" }}
      />
      <path d="M7.9 17.4H12.7" strokeWidth={strokeWidth * 0.75} />
      <motion.path
        d="M18 12.5H21V5.8"
        initial={false}
        animate={on ? { d: ["M18 12.5H21V5.8", "M18 12.5H21V11.6", "M18 12.5H21V11.6", "M18 12.5H21V5.8"] } : { d: "M18 12.5H21V5.8" }}
        transition={{ duration: 0.5 / speed, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
      />
      <motion.circle
        cx="21"
        cy="5.8"
        r="1.4"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 5.8, 5.8, 0] } : { y: 0 }}
        transition={{ duration: 0.5 / speed, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
