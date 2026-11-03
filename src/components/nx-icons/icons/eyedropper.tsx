"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type EyedropperIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff2d92. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An eyedropper whose bulb squeezes so the colour drains from the tube and a drop falls and splashes, then the bulb releases and the tube fills back up. */
export function EyedropperIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: EyedropperIconProps) {
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
      <g transform="translate(0 0.75)">
      <motion.ellipse
        cx="5.2"
        cy="21.4"
        rx="1"
        ry="0.4"
        stroke={accent}
        strokeWidth={1}
        initial={false}
        animate={on ? { rx: [1, 3.6], ry: [0.4, 1.2], opacity: [0, 0.9, 0] } : { opacity: 0 }}
        transition={{ duration: 0.42 / speed, delay: (0.54) / speed, ease: "easeOut" }}
      />
      <motion.circle
        cx="5.2"
        cy="19.1"
        r="1.4"
        fill={accent}
        stroke="none"
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={on ? { y: [0, 0, 3], scale: [0.3, 1, 1], opacity: [0, 1, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.32 / speed, delay: (0.2) / speed, times: [0, 0.35, 1], ease: "easeIn" }}
      />
      <g transform="translate(0 -0.5) rotate(45 12 12)">
        <motion.path
          d="M12 20.4V12.8"
          stroke={accent}
          strokeWidth={1.6}
          initial={false}
          animate={on ? { pathLength: [1, 0.02, 0.02, 1] } : { pathLength: 1 }}
          transition={{ duration: 1 / speed, times: [0, 0.3, 0.55, 1], ease: "easeInOut" }}
        />
        <motion.rect
          x="9.6"
          y="2.6"
          width="4.8"
          height="6.2"
          rx="2.4"
          style={{ originX: "50%", originY: "100%" }}
          initial={false}
          animate={on ? { scaleY: [1, 0.72, 0.72, 1], scaleX: [1, 1.16, 1.16, 1] } : { scaleY: 1, scaleX: 1 }}
          transition={{ duration: 0.8 / speed, times: [0, 0.28, 0.5, 0.8], ease: "easeInOut" }}
        />
        <path d="M8.2 8.8h7.6" />
        <path d="M10 8.8v8.4l2 4.4 2-4.4V8.8" />
      </g>
      </g>
    </svg>
  );
}
