"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BatteryChargingIconProps = {
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

/** An upright battery that fills with charge from the bottom while its lightning bolt flashes, then drains back to rest. */
export function BatteryChargingIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BatteryChargingIconProps) {
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
        x="7.5"
        y="6"
        width="9"
        height="14"
        rx="1.4"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "100%" }}
        initial={false}
        animate={on ? { scaleY: [0, 1, 1, 0], fillOpacity: [0.3, 0.3, 0.3, 0.3] } : { scaleY: 0, fillOpacity: 0.3 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.55, 0.75, 1], ease: "easeInOut" }}
      />
      <rect x="6.5" y="5" width="11" height="16" rx="2.4" />
      <motion.path
        d="M10 3h4"
        initial={false}
        animate={on ? { y: [0, 0, -0.7, 0] } : { y: 0 }}
        transition={{ duration: 1.1 / speed, times: [0, 0.5, 0.6, 0.8], ease: "easeOut" }}
      />
      <motion.path
        d="M13.2 8.6 9.8 13.4h2.4l-1.4 4.6 3.4-5.6h-2.4z"
        fill={accent}
        stroke={accent}
        strokeWidth={1.2}
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.3, 1, 1.3, 1], opacity: [1, 0.5, 1, 0.5, 1] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      />
    </svg>
  );
}
