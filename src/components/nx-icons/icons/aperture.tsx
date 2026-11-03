"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ApertureIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff9f0a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A camera iris whose six blades turn a sixth of a revolution, squeezing shut and then flaring wide open before settling. */
export function ApertureIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ApertureIconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { rotate: [0, 60] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <motion.path
          d="M12 8.6L20.84 13.7M14.94 10.3L14.94 20.5M14.94 13.7L6.11 18.8M12 15.4L3.16 10.3M9.06 13.7L9.06 3.5M9.06 10.3L17.89 5.2"
          stroke={accent}
          initial={false}
          animate={on ? { d: [
            "M12 8.6L20.84 13.7M14.94 10.3L14.94 20.5M14.94 13.7L6.11 18.8M12 15.4L3.16 10.3M9.06 13.7L9.06 3.5M9.06 10.3L17.89 5.2",
            "M12 11.1L20.15 15.81M12.78 11.55L12.78 20.97M12.78 12.45L4.62 17.16M12 12.9L3.85 8.19M11.22 12.45L11.22 3.03M11.22 11.55L19.38 6.84",
            "M12 6.6L21 11.79M16.68 9.3L16.68 19.69M16.68 14.7L7.68 19.89M12 17.4L3 12.21M7.32 14.7L7.32 4.31M7.32 9.3L16.32 4.11",
            "M12 8.6L20.84 13.7M14.94 10.3L14.94 20.5M14.94 13.7L6.11 18.8M12 15.4L3.16 10.3M9.06 13.7L9.06 3.5M9.06 10.3L17.89 5.2",
          ] } : { d: "M12 8.6L20.84 13.7M14.94 10.3L14.94 20.5M14.94 13.7L6.11 18.8M12 15.4L3.16 10.3M9.06 13.7L9.06 3.5M9.06 10.3L17.89 5.2" }}
          transition={{ duration: 0.9 / speed, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
        />
      </motion.g>
    </svg>
  );
}
