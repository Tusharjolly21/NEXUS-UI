"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SpeakerIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff375f. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A speaker whose woofer thumps on the kick and snare of a beat, the tweeter flicking on the off-beat. */
export function SpeakerIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SpeakerIconProps) {
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
      <rect x="6" y="2.5" width="12" height="19" rx="2.6" />
      <motion.circle
        cx="12"
        cy="7"
        r="1.2"
        fill="currentColor"
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1, 1, 1.7, 1, 1, 1, 1.7, 1] } : { scale: 1 }}
        transition={{ duration: 0.8 / speed }}
      />
      <motion.circle
        cx="12"
        cy="14.5"
        r="3.8"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.2, 1, 1.08, 1, 1.2, 1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.8 / speed }}
      />
      <motion.circle
        cx="12"
        cy="14.5"
        r="1.3"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.5, 1, 1.2, 1, 1.5, 1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.8 / speed }}
      />
    </svg>
  );
}
