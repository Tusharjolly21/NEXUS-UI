"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ToggleIconProps = {
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

/** A switch whose knob slides over with a stretch while the track fills with colour. */
export function ToggleIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ToggleIconProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const on = !reduce && (play ?? hover);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
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
      <motion.rect
        x="2.8"
        y="7.5"
        width="18.4"
        height="9"
        rx="4.5"
        fill={accent}
        initial={false}
        animate={{ fillOpacity: on ? 0.32 : 0 }}
        transition={{ duration: 0.25 / speed }}
      />
      <motion.circle
        cy="12"
        r="3"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={{ cx: on ? 16.2 : 7.8, scaleX: on ? [1, 1.35, 1] : [1, 1.2, 1] }}
        transition={{ cx: { type: "spring", stiffness: 520 * speed * speed, damping: 22 * speed }, scaleX: { duration: 0.3 / speed } }}
      />
    </svg>
  );
}
