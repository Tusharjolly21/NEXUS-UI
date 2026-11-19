"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PictureFrameIconProps = {
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

/** The framed picture swings on its nail like it was just knocked, then eases back to hang straight. */
export function PictureFrameIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PictureFrameIconProps) {
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
      <g transform="translate(0 0.08)">

      <motion.g
        style={{ originX: "50%", originY: "13.75%" }}
        initial={false}
        animate={on ? { rotate: [0, 7, -5, 3, -1.2, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.2, 0.42, 0.62, 0.82, 1], ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M7.4 15.4L10.6 12.9L12.6 14.9L13.6 14.4L16.6 16L16.6 17.6L7.4 17.6Z" fill={accent} stroke="none" />
        <circle cx="14.1" cy="12.6" r="0.9" fill={accent} stroke="none" />
        <path d="M8.2 7.2L12 3.3L15.8 7.2" strokeWidth={strokeWidth * 0.75} />
        <path d="M4.4 8.8A1.6 1.6 0 0 1 6 7.2L18 7.2A1.6 1.6 0 0 1 19.6 8.8L19.6 19A1.6 1.6 0 0 1 18 20.6L6 20.6A1.6 1.6 0 0 1 4.4 19Z" />
        <path d="M7.4 10.8A0.6 0.6 0 0 1 8 10.2L16 10.2A0.6 0.6 0 0 1 16.6 10.8L16.6 17A0.6 0.6 0 0 1 16 17.6L8 17.6A0.6 0.6 0 0 1 7.4 17Z" strokeWidth={strokeWidth * 0.75} />
      </motion.g>
      <circle cx="12" cy="3.3" r="1.1" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
