"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BluetoothIconProps = {
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

/** The Bluetooth rune that pairs: signal arcs flash left then right and the rune locks in with a pulse. */
export function BluetoothIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: BluetoothIconProps) {
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
        d="M3.6 9.4a4.6 4.6 0 0 0 0 5.2"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, -1.2, 0], opacity: [1, 0.2, 1] } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.35 / speed, delay: (0.1) / speed }}
      />
      <motion.path
        d="M20.4 9.4a4.6 4.6 0 0 1 0 5.2"
        stroke={accent}
        initial={false}
        animate={on ? { x: [0, 1.2, 0], opacity: [1, 0.2, 1] } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.35 / speed, delay: (0.25) / speed }}
      />
      <motion.path
        d="M7.5 7.8 16.5 16.2 12 20.2V3.8l4.5 4-9 8.4"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 / speed, delay: (0.45) / speed }}
      />
    </svg>
  );
}
