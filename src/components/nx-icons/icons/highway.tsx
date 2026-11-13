"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type HighwayIconProps = {
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

/** A highway in perspective whose centre dashes stream toward you as the road rolls by. */
export function HighwayIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: HighwayIconProps) {
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
<g transform="translate(0 -0.48)">
      <motion.path
        d="M12 5V5.3"
        stroke={accent}
        strokeLinecap="butt"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M12 5V5.3", "M12 6.6V8.4"], opacity: [0, 1] } : { d: "M12 5V5.3", opacity: 0, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M12 6.6V8.4"
        stroke={accent}
        strokeLinecap="butt"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M12 6.6V8.4", "M12 10.6V13.6"], opacity: [1, 1] } : { d: "M12 6.6V8.4", opacity: 1, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M12 10.6V13.6"
        stroke={accent}
        strokeLinecap="butt"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M12 10.6V13.6", "M12 16.4V20.6"], opacity: [1, 1] } : { d: "M12 10.6V13.6", opacity: 1, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
      <motion.path
        d="M12 16.4V20.6"
        stroke={accent}
        strokeLinecap="butt"
        strokeWidth={strokeWidth * 0.75}
        initial={false}
        animate={on ? { d: ["M12 16.4V20.6", "M12 21.9V23.4"], opacity: [1, 0] } : { d: "M12 16.4V20.6", opacity: 1, transition: { duration: 0 / speed } }}
        transition={{ duration: 0.8 / speed, ease: "easeInOut" }}
      />
      <path d="M3 21.5L10 3.5M21 21.5L14 3.5" />
</g>
    </svg>
  );
}
