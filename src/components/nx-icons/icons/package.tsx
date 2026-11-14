"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PackageIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #c2763b. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A parcel that crouches, hops and pulls its tape off in the air, then lands with the tape slapped back on. */
export function PackageIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PackageIconProps) {
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
      <g transform="translate(0 0)">
        <motion.g
          style={{ originX: "50%", originY: "90.833%" }}
          initial={false}
          animate={on ? { y: [0, 0, -1, -1.6, 0, 0, 0, 0], scaleX: [1, 1.03, 0.98, 1, 1.06, 0.985, 1.005, 1], scaleY: [1, 0.93, 1.04, 1, 0.9, 1.03, 0.99, 1] } : { y: 0, scaleX: 1, scaleY: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.12, 0.22, 0.34, 0.58, 0.72, 0.86, 1], ease: ["easeInOut", "easeOut", "easeOut", "easeIn", "easeOut", "easeInOut", "easeInOut"] }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <motion.path
            d="M9.575 4.6 L17.196 9 L17.196 17.8 L14.425 19.4 L14.425 10.6 L6.804 6.2 Z"
            fill={accent}
            stroke="none"
            initial={false}
            animate={on ? { d: ["M9.575 4.6 L17.196 9 L17.196 17.8 L14.425 19.4 L14.425 10.6 L6.804 6.2 Z", "M9.575 4.6 L17.196 9 L17.196 17.8 L14.425 19.4 L14.425 10.6 L6.804 6.2 Z", "M9.575 4.6 L9.575 4.6 L9.575 4.6 L6.804 6.2 L6.804 6.2 L6.804 6.2 Z", "M9.575 4.6 L9.575 4.6 L9.575 4.6 L6.804 6.2 L6.804 6.2 L6.804 6.2 Z", "M9.575 4.6 L17.196 9 L17.196 9 L14.425 10.6 L14.425 10.6 L6.804 6.2 Z", "M9.575 4.6 L17.196 9 L17.196 17.8 L14.425 19.4 L14.425 10.6 L6.804 6.2 Z", "M9.575 4.6 L17.196 9 L17.196 17.8 L14.425 19.4 L14.425 10.6 L6.804 6.2 Z"] } : { d: "M9.575 4.6 L17.196 9 L17.196 17.8 L14.425 19.4 L14.425 10.6 L6.804 6.2 Z" }}
            transition={{ duration: 1 / speed, times: [0, 0.12, 0.3, 0.38, 0.48, 0.58, 1], ease: ["easeInOut", "easeIn", "linear", "easeOut", "easeOut", "linear"] }}
          />
          <path d="M12 3.2 L19.621 7.6 L19.621 16.4 L12 20.8 L4.379 16.4 L4.379 7.6 Z" />
          <path d="M4.379 7.6 L12 12 L19.621 7.6 M12 12 L12 20.8" />
          <path d="M9.714 13.32 L6.665 11.56 L6.665 15.08 L9.714 16.84 Z" strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </g>
    </svg>
  );
}
