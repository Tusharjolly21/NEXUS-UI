"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BigBenIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffb340. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The minute hand sweeps a full turn round the lit clock face, then the face pulses and the tower shudders as the great bell strikes. */
export function BigBenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BigBenIconProps) {
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
      <g transform="translate(0 -0.09)">

      <motion.g
        style={{ originX: "50%", originY: "89.17%" }}
        initial={false}
        animate={on ? { rotate: [0, 0, -1.6, 1.3, -0.7, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.6, 0.68, 0.78, 0.88, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.circle
          cx="12"
          cy="10.4"
          r="3.1"
          fill={accent}
          stroke="none"
          style={{ originX: "50%", originY: "50%" }}
          initial={false}
          animate={on ? { scale: [1, 1, 1.12, 1] } : { scale: 1 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.6, 0.7, 1], ease: "easeInOut" }}
        />
        <g fill="currentColor" stroke="none"><circle cx="12" cy="8.05" r="0.5" /><circle cx="14.35" cy="10.4" r="0.5" /><circle cx="12" cy="12.75" r="0.5" /><circle cx="9.65" cy="10.4" r="0.5" /></g>
        <path d="M12 10.4L11.13 9.9" strokeWidth={strokeWidth * 0.75} />
        <motion.g
          style={{ originX: "50%", originY: "43.33%" }}
          initial={false}
          animate={on ? { rotate: [0, 360, 360] } : { rotate: 0 }}
          transition={{ duration: 1.1 / speed, times: [0, 0.6, 1], ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 10.4L13.6 9.47" strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <path d="M12 2.4L14.6 5.6H9.4Z" fill="currentColor" stroke="none" />
        <path d="M8.6 21.4L8.6 15.2L7.8 15.2A0.6 0.6 0 0 1 7.2 14.6L7.2 6.2A0.6 0.6 0 0 1 7.8 5.6L9.4 5.6L11.61 2.88A0.5 0.5 0 0 1 12.39 2.88L14.6 5.6L16.2 5.6A0.6 0.6 0 0 1 16.8 6.2L16.8 14.6A0.6 0.6 0 0 1 16.2 15.2L15.4 15.2L15.4 21.4" />
        <path d="M9.4 5.6H14.6M8.6 15.2H15.4M6.8 21.4H17.2" />
        <path d="M12 17.6V19" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
      </g>
    </svg>
  );
}
