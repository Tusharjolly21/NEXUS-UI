"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PumpkinIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #34c759. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The pumpkin hops, squashes as it lands and its leaf flutters on the stem. */
export function PumpkinIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PumpkinIconProps) {
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
      <g transform="translate(0 -0.4)">

      <motion.g
        initial={false}
        animate={on ? { y: [0, -2.2, 0, 0, 0] } : { y: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.55, 0.75, 1], ease: ["easeOut", "easeIn", "linear", "linear"] }}
      >
        <motion.g
          style={{ originX: "50%", originY: "85.83%" }}
          initial={false}
          animate={on ? { scaleX: [1, 0.95, 1.08, 0.98, 1], scaleY: [1, 1.05, 0.9, 1.02, 1] } : { scaleX: 1, scaleY: 1 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.58, 0.78, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <motion.g
            style={{ originX: "53.64%", originY: "31.5%" }}
            initial={false}
            animate={on ? { rotate: [0, -14, 10, -5, 0] } : { rotate: 0 }}
            transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.58, 0.78, 1], ease: "easeInOut" }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <path d="M12.87 7.56Q11.76 4.62 8.63 4.91Q9.75 7.85 12.87 7.56Z" fill={accent} stroke="none" />
          </motion.g>
          <ellipse cx="12" cy="14" rx="4" ry="6.6" />
          <path d="M9.63 19.32A4.6 6 0 1 1 9.63 8.68M14.37 8.68A4.6 6 0 1 1 14.37 19.32" />
          <path d="M12 7.4Q12 5.2 13.6 4.2" />
        </motion.g>
      </motion.g>
      </g>
    </svg>
  );
}
