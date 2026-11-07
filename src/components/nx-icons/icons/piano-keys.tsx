"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PianoKeysIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #5e5ce6. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A run of piano keys pressed down left to right, white keys lighting up and black keys dipping, then springing back. */
export function PianoKeysIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PianoKeysIconProps) {
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
      <rect x="2.5" y="3.5" width="19" height="17" rx="2" />
      <motion.rect
        x="3.5"
        y="13.6"
        width="2.75"
        height="5.9"
        rx="0.7"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [0, 1, 0], opacity: [0, 1, 0] } : { scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.26 / speed, delay: (0) / speed }}
      />
      <motion.rect
        x="8.25"
        y="13.6"
        width="2.75"
        height="5.9"
        rx="0.7"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [0, 1, 0], opacity: [0, 1, 0] } : { scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.26 / speed, delay: (0.2) / speed }}
      />
      <motion.rect
        x="13"
        y="13.6"
        width="2.75"
        height="5.9"
        rx="0.7"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [0, 1, 0], opacity: [0, 1, 0] } : { scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.26 / speed, delay: (0.4) / speed }}
      />
      <motion.rect
        x="17.75"
        y="13.6"
        width="2.75"
        height="5.9"
        rx="0.7"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [0, 1, 0], opacity: [0, 1, 0] } : { scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.26 / speed, delay: (0.6) / speed }}
      />
      <path d="M7.25 12.5V20.5M12 12.5V20.5M16.75 12.5V20.5" />
      <motion.rect
        x="5.95"
        y="3.5"
        width="2.6"
        height="9"
        rx="0.7"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 1.1, 0] } : { y: 0 }}
        transition={{ duration: 0.22 / speed, delay: (0.13) / speed }}
      />
      <motion.rect
        x="10.7"
        y="3.5"
        width="2.6"
        height="9"
        rx="0.7"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 1.1, 0] } : { y: 0 }}
        transition={{ duration: 0.22 / speed, delay: (0.33) / speed }}
      />
      <motion.rect
        x="15.45"
        y="3.5"
        width="2.6"
        height="9"
        rx="0.7"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 1.1, 0] } : { y: 0 }}
        transition={{ duration: 0.22 / speed, delay: (0.53) / speed }}
      />
    </svg>
  );
}
