"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WatchIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff3b30. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A wristwatch whose second hand ticks round the dial in eight crisp steps. */
export function WatchIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WatchIconProps) {
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
      <path d="M9.2 7 9.8 3h4.4l.6 4M9.2 17l.6 4h4.4l.6-4" />
      <circle cx="12" cy="12" r="5.5" />
      <path d="M12 12V8.6M12 12l2.4 1.4" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360] } : { rotate: 0 }}
        transition={{ duration: 0.8 / speed, ease: ["backOut", "backOut", "backOut", "backOut", "backOut", "backOut", "backOut", "backOut"] }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 12V9.2" stroke={accent} />
      </motion.g>
    </svg>
  );
}
