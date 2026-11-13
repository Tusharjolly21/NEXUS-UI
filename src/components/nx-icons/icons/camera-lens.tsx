"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CameraLensIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #0a84ff. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The glass element pulls focus, shrinking and dimming then opening back up, as if the lens were zooming. */
export function CameraLensIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CameraLensIconProps) {
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
      <g transform="translate(-0.1 0)">
      <motion.ellipse
        cx="8.2"
        cy="12"
        rx="2.8"
        ry="6.4"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 0.7, 0.7, 1], opacity: [1, 0.6, 0.6, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.55, 1], ease: "easeInOut" }}
      />
      <ellipse cx="8.2" cy="12" rx="5" ry="8.6" />
      <path d="M8.2 3.4L19 6M8.2 20.6L19 18" />
      <path d="M19 6A2 6 0 0 1 19 18" />
      <path d="M14.4 4.89A1.2 7.11 0 0 1 14.4 19.11" strokeWidth={strokeWidth * 0.75} />
      <path d="M16.6 5.42A1.2 6.58 0 0 1 16.6 18.58" strokeWidth={strokeWidth * 0.75} />
      </g>
    </svg>
  );
}
