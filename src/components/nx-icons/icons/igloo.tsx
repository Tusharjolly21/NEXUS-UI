"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type IglooIconProps = {
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

/** A warm fire glow flickers up inside the doorway of the snow house and settles to a steady light. */
export function IglooIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: IglooIconProps) {
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
      <g transform="translate(0 -1.96)">

      <motion.path
        d="M9.8 18.6V17A2.2 2.2 0 0 1 14.2 17V18.6Z"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [1, 0.55, 1.06, 0.72, 1.03, 1], opacity: [1, 0.55, 1, 0.7, 1, 1] } : { scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.9 / speed, times: [0, 0.16, 0.36, 0.56, 0.78, 1], ease: "easeInOut" }}
      />
      <path d="M2.7 18.6A9.3 9.3 0 0 1 21.3 18.6Z" />
      <path d="M9.8 18.6V17A2.2 2.2 0 0 1 14.2 17V18.6" />
      <path d="M3.23 15.5H9.8M14.2 15.5H20.77M5.07 12.4H18.93" strokeWidth={strokeWidth * 0.75} />
      <path d="M6.25 18.6V15.5M17.75 18.6V15.5M12 12.4V14.8M7.13 15.5V12.4M16.87 15.5V12.4" strokeWidth={strokeWidth * 0.75} />
      </g>
    </svg>
  );
}
