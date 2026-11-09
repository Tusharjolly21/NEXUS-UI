"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ScooterIconProps = {
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

/** A kick scooter that rolls forward on two spinning wheels and settles back. */
export function ScooterIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ScooterIconProps) {
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
        animate={on ? { x: [0, -0.5, 1.4, 0] } : { x: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.2, 0.6, 1], ease: "easeInOut" }}
      >
        <path d="M4.8 14H17.98M18.2 15.4L16.2 2.6M13.2 2.6H19.2" stroke={accent} />
        {([5.8, 18.2] as number[]).map((x) => (
          <g key={x}>
            <circle cx={x} cy="18.3" r="2.9" />
            <motion.path
              d={`M${x - 1.4} 18.3h2.8`}
              strokeWidth={strokeWidth * 0.5}
              style={{ originX: "50%", originY: "50%" }}
              initial={false}
              animate={on ? { rotate: [0, 720] } : { rotate: 0 }}
              transition={{ duration: 0.9 / speed, ease: "easeOut" }}
            />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}
