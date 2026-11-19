"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BooleanUnionIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #30d158. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The merged shape pulls apart at the waist into two squares, then they snap back together and fuse into one outline. */
export function BooleanUnionIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BooleanUnionIconProps) {
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
      <motion.path
        d="M4 6.2A2.2 2.2 0 0 1 6.2 4L12.8 4A2.2 2.2 0 0 1 15 6.2L15 8A1 1 0 0 0 16 9L17.8 9A2.2 2.2 0 0 1 20 11.2L20 17.8A2.2 2.2 0 0 1 17.8 20L11.2 20A2.2 2.2 0 0 1 9 17.8L9 16A1 1 0 0 0 8 15L6.2 15A2.2 2.2 0 0 1 4 12.8Z"
        fill={accent}
        fillOpacity={0.3}
        initial={false}
        animate={on ? { d: ["M4 6.2A2.2 2.2 0 0 1 6.2 4L12.8 4A2.2 2.2 0 0 1 15 6.2L15 8A1 1 0 0 0 16 9L17.8 9A2.2 2.2 0 0 1 20 11.2L20 17.8A2.2 2.2 0 0 1 17.8 20L11.2 20A2.2 2.2 0 0 1 9 17.8L9 16A1 1 0 0 0 8 15L6.2 15A2.2 2.2 0 0 1 4 12.8Z", "M2.5 4.7A2.2 2.2 0 0 1 4.7 2.5L11.3 2.5A2.2 2.2 0 0 1 13.5 4.7L13.5 9.5A1 1 0 0 0 14.5 10.5L19.3 10.5A2.2 2.2 0 0 1 21.5 12.7L21.5 19.3A2.2 2.2 0 0 1 19.3 21.5L12.7 21.5A2.2 2.2 0 0 1 10.5 19.3L10.5 14.5A1 1 0 0 0 9.5 13.5L4.7 13.5A2.2 2.2 0 0 1 2.5 11.3Z", "M2.5 4.7A2.2 2.2 0 0 1 4.7 2.5L11.3 2.5A2.2 2.2 0 0 1 13.5 4.7L13.5 9.5A1 1 0 0 0 14.5 10.5L19.3 10.5A2.2 2.2 0 0 1 21.5 12.7L21.5 19.3A2.2 2.2 0 0 1 19.3 21.5L12.7 21.5A2.2 2.2 0 0 1 10.5 19.3L10.5 14.5A1 1 0 0 0 9.5 13.5L4.7 13.5A2.2 2.2 0 0 1 2.5 11.3Z", "M4.55 6.75A2.2 2.2 0 0 1 6.75 4.55L13.35 4.55A2.2 2.2 0 0 1 15.55 6.75L15.55 7.45A1 1 0 0 0 16.55 8.45L17.25 8.45A2.2 2.2 0 0 1 19.45 10.65L19.45 17.25A2.2 2.2 0 0 1 17.25 19.45L10.65 19.45A2.2 2.2 0 0 1 8.45 17.25L8.45 16.55A1 1 0 0 0 7.45 15.55L6.75 15.55A2.2 2.2 0 0 1 4.55 13.35Z", "M3.8 6A2.2 2.2 0 0 1 6 3.8L12.6 3.8A2.2 2.2 0 0 1 14.8 6L14.8 8.2A1 1 0 0 0 15.8 9.2L18 9.2A2.2 2.2 0 0 1 20.2 11.4L20.2 18A2.2 2.2 0 0 1 18 20.2L11.4 20.2A2.2 2.2 0 0 1 9.2 18L9.2 15.8A1 1 0 0 0 8.2 14.8L6 14.8A2.2 2.2 0 0 1 3.8 12.6Z", "M4 6.2A2.2 2.2 0 0 1 6.2 4L12.8 4A2.2 2.2 0 0 1 15 6.2L15 8A1 1 0 0 0 16 9L17.8 9A2.2 2.2 0 0 1 20 11.2L20 17.8A2.2 2.2 0 0 1 17.8 20L11.2 20A2.2 2.2 0 0 1 9 17.8L9 16A1 1 0 0 0 8 15L6.2 15A2.2 2.2 0 0 1 4 12.8Z"] } : { d: "M4 6.2A2.2 2.2 0 0 1 6.2 4L12.8 4A2.2 2.2 0 0 1 15 6.2L15 8A1 1 0 0 0 16 9L17.8 9A2.2 2.2 0 0 1 20 11.2L20 17.8A2.2 2.2 0 0 1 17.8 20L11.2 20A2.2 2.2 0 0 1 9 17.8L9 16A1 1 0 0 0 8 15L6.2 15A2.2 2.2 0 0 1 4 12.8Z" }}
        transition={{ duration: 0.9 / speed, times: [0, 0.32, 0.45, 0.66, 0.84, 1], ease: "easeInOut" }}
      />
    </svg>
  );
}
