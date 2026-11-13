"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FolderOpenIconProps = {
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

/** The folder's front flap swings shut, then springs open again as a sheet pops up out of it. */
export function FolderOpenIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FolderOpenIconProps) {
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
      <g transform="translate(-0.5 0)">

      <motion.path
        d="M8.5 9.8H15.5"
        stroke={accent}
        initial={false}
        animate={on ? { y: [0, 0, 0, -1.6, 0] } : { y: 0 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.45, 0.65, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M3.5 19V6.5A1.5 1.5 0 0 1 5 5H9.2L11.5 7.5H18.5A1.5 1.5 0 0 1 20 9V12"
        initial={false}
        animate={on ? { d: ["M3.5 19V6.5A1.5 1.5 0 0 1 5 5H9.2L11.5 7.5H18.5A1.5 1.5 0 0 1 20 9V12", "M3.5 19V6.5A1.5 1.5 0 0 1 5 5H9.2L11.5 7.5H18.5A1.5 1.5 0 0 1 20 9V10.5", "M3.5 19V6.5A1.5 1.5 0 0 1 5 5H9.2L11.5 7.5H18.5A1.5 1.5 0 0 1 20 9V10.5", "M3.5 19V6.5A1.5 1.5 0 0 1 5 5H9.2L11.5 7.5H18.5A1.5 1.5 0 0 1 20 9V12"] } : { d: "M3.5 19V6.5A1.5 1.5 0 0 1 5 5H9.2L11.5 7.5H18.5A1.5 1.5 0 0 1 20 9V12" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.45, 1], ease: ["easeIn", "linear", "easeOut"] }}
      />
      <motion.path
        d="M3.5 19V12H21.5L19 19Z"
        initial={false}
        animate={on ? { d: ["M3.5 19V12H21.5L19 19Z", "M3.5 19V10.5H20.5L20.5 19Z", "M3.5 19V10.5H20.5L20.5 19Z", "M3.5 19V12H21.5L19 19Z"] } : { d: "M3.5 19V12H21.5L19 19Z" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.3, 0.45, 1], ease: ["easeIn", "linear", "easeOut"] }}
      />
      </g>
    </svg>
  );
}
