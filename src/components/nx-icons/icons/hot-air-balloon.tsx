"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HotAirBalloonIconProps = {
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

/** A hot air balloon that rises and sways on its ropes while the burner flame flickers. */
export function HotAirBalloonIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HotAirBalloonIconProps) {
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
        style={{ originX: "50%", originY: "12%" }}
        initial={false}
        animate={on ? { y: [0, -1.1, -1.1, 0], rotate: [0, 3.5, -3, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.8 14.9L6.26 11.5A6.3 6.3 0 1 1 17.74 11.5L16.2 14.9" />
        <path d="M7.8 14.9H16.2" strokeWidth={strokeWidth * 0.5} />
        <path d="M12 2.6A2.83 6.3 0 0 0 9.42 11.5L10.11 14.9M12 2.6A2.83 6.3 0 0 1 14.58 11.5L13.89 14.9" strokeWidth={strokeWidth * 0.45} />
        <path d="M7.8 14.9L8.4 17.9M9.8 14.9L10.1 17.9M14.2 14.9L13.9 17.9M16.2 14.9L15.6 17.9" strokeWidth={strokeWidth * 0.45} />
        <rect x="8.4" y="17.9" width="7.2" height="3.5" rx="1" />
        <motion.path
          d="M12 10.4C12.7 11.8 12.9 12.8 12.9 13.5A0.9 0.9 0 0 1 11.1 13.5C11.1 12.8 11.3 11.8 12 10.4Z"
          stroke={accent}
          fill={accent}
          strokeWidth={0.8}
          style={{ originX: "50%", originY: "60%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1.5, 0.85, 1.35, 0.9, 1.25, 1], scaleX: [1, 0.85, 1.1, 0.9, 1.08, 0.95, 1] } : { scaleY: 1, scaleX: 1 }}
          transition={{ duration: 1.2 / speed, ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
