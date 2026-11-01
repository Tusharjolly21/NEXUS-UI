"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SoccerBallIconProps = {
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

/** A football that is kicked, spins through the air and bounces twice. */
export function SoccerBallIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SoccerBallIconProps) {
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
        animate={on ? { y: [0, -5, 0, -2, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.55, 0.8, 1], ease: "easeOut" }}
      >
        <motion.g
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { rotate: [0, 200] } : { rotate: 0 }}
          transition={{ duration: 0.9 / speed, ease: "easeOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8.2V5.8M15.6 10.8l2.3-.7M14.2 15.1l1.45 1.9M9.8 15.1 8.35 17M8.4 10.8 6.1 10.1" />
          <path d="M12 8.2l3.61 2.63-1.38 4.24H9.77l-1.38-4.24z" fill={accent} fillOpacity={0.25} stroke={accent} strokeWidth={1.6} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
