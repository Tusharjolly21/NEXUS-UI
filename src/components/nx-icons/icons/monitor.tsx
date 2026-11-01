"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MonitorIconProps = {
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

/** A desktop monitor that flashes awake and pops open a window on its screen. */
export function MonitorIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: MonitorIconProps) {
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
      <motion.rect
        x="4.2"
        y="5.2"
        width="15.6"
        height="9.6"
        rx="1.2"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { fillOpacity: [0, 0.55, 0.12, 0] } : { fillOpacity: 0 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.2, 0.6, 1] }}
      />
      <rect x="3" y="4" width="18" height="12" rx="2.2" />
      <path d="M12 16v3M8 20h8" />
      <motion.rect
        x="7"
        y="7.5"
        width="10"
        height="5"
        rx="1"
        stroke={accent}
        strokeWidth={1.6}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [0.2, 0.2, 1.12, 1], opacity: [0, 0, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 / speed, times: [0, 0.3, 0.6, 0.8], ease: "easeOut" }}
      />
    </svg>
  );
}
