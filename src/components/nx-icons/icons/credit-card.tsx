"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CreditCardIconProps = {
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

/** A card that taps to pay: it dips, its chip glows and three contactless waves ripple out. */
export function CreditCardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: CreditCardIconProps) {
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
      <motion.g
        style={{ originX: "50%", originY: "60%" }}
        initial={false}
        animate={on ? { rotate: [0, -5, 0], y: [0, -1.2, 0] } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect x="2.8" y="6" width="18.4" height="12.4" rx="2.4" />
        <path d="M2.8 10.4h18.4" />
        <motion.rect
          x="5.6"
          y="13"
          width="3.4"
          height="2.6"
          rx="0.6"
          fill={accent}
          stroke={accent}
          strokeWidth={1.4}
          initial={false}
          animate={on ? { fillOpacity: [0, 1, 0.4] } : { fillOpacity: 0 }}
          transition={{ duration: 0.8 / speed }}
        />
        {["M13.8 13.4a3 3 0 0 1 0 2.8", "M15.9 12.2a5.2 5.2 0 0 1 0 5.2", "M18 11a7.4 7.4 0 0 1 0 7.6"].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke={accent}
            initial={false}
            animate={on ? { opacity: [0.2, 1, 0.2] } : { opacity: 0.55 }}
            transition={on ? { duration: 0.5 / speed, delay: (0.1 + i * 0.15) / speed } : { duration: 0.2 / speed }}
          />
        ))}
      </motion.g>
    </svg>
  );
}
