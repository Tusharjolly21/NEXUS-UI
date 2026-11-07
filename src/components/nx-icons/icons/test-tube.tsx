"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TestTubeIconProps = {
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

/** The tube rocks gently while the liquid sloshes from side to side and bubbles rise through it. */
export function TestTubeIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: TestTubeIconProps) {
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
        style={{ originX: "50%", originY: "62%" }}
        initial={false}
        animate={on ? { rotate: [0, -6, 6, -3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M8 11.5Q10 10 12 11.5Q14 13 16 11.5V16a4 4 0 0 1-8 0z"
          fill={accent}
          fillOpacity={0.28}
          stroke="none"
          initial={false}
          animate={on ? { d: [
            "M8 11.5Q10 10 12 11.5Q14 13 16 11.5V16a4 4 0 0 1-8 0z",
            "M8 10.1Q10 9.4 12 11.2Q14 13.2 16 12.9V16a4 4 0 0 1-8 0z",
            "M8 12.9Q10 13.2 12 11.2Q14 9.4 16 10.1V16a4 4 0 0 1-8 0z",
            "M8 10.8Q10 10.2 12 11.4Q14 12.4 16 12.1V16a4 4 0 0 1-8 0z",
            "M8 11.5Q10 10 12 11.5Q14 13 16 11.5V16a4 4 0 0 1-8 0z"
          ] } : { d: "M8 11.5Q10 10 12 11.5Q14 13 16 11.5V16a4 4 0 0 1-8 0z" }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        />
        <motion.path
          d="M8 11.5Q10 10 12 11.5Q14 13 16 11.5"
          stroke={accent}
          strokeWidth={1.6}
          initial={false}
          animate={on ? { d: [
            "M8 11.5Q10 10 12 11.5Q14 13 16 11.5",
            "M8 10.1Q10 9.4 12 11.2Q14 13.2 16 12.9",
            "M8 12.9Q10 13.2 12 11.2Q14 9.4 16 10.1",
            "M8 10.8Q10 10.2 12 11.4Q14 12.4 16 12.1",
            "M8 11.5Q10 10 12 11.5Q14 13 16 11.5"
          ] } : { d: "M8 11.5Q10 10 12 11.5Q14 13 16 11.5" }}
          transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
        />
        {([[10.3, 17.5, 0.9, 0.1], [13.5, 15.8, 0.7, 0.3], [11.4, 14.2, 0.6, 0.5]] as [number, number, number, number][]).map(([bx, by, br, bd]) => (
          <motion.circle
            key={bx}
            cx={bx}
            cy={by}
            r={br}
            fill={accent}
            stroke="none"
            initial={false}
            animate={on ? { y: [0, -3.2, 3.2, 0], opacity: [1, 0, 0, 1] } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.8 / speed, delay: (bd - 0.1) / speed, times: [0, 0.45, 0.46, 1], ease: "easeIn" }}
          />
        ))}
        <path d="M8 4V16a4 4 0 0 0 8 0V4M6.5 4H17.5" />
      </motion.g>
    </svg>
  );
}
