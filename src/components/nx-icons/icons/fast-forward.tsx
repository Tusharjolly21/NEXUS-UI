"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FastForwardIconProps = {
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

/** Two right-pointing triangles that race off the edge one after the other and slide back in from the left, the front one leading. */
export function FastForwardIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: FastForwardIconProps) {
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
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
      {([["M3.7 6.8 10.7 12 3.7 17.2z", accent, 0.09], ["M13.3 6.8 20.3 12 13.3 17.2z", "currentColor", 0]] as [string, string, number][]).map(([d, c, delay], i) => (
        <motion.path
          key={i}
          d={d}
          stroke={c}
          initial={false}
          animate={on ? { x: [0, 15, -15, 0], opacity: [1, 1, 0, 0, 1, 1] } : { x: 0, opacity: 1 }}
          transition={{
            x: { duration: 0.85 / speed, delay: (on ? delay : 0) / speed, times: [0, 0.42, 0.43, 1], ease: ["easeIn", "linear", "easeOut"] },
            opacity: { duration: 0.85 / speed, delay: (on ? delay : 0) / speed, times: [0, 0.22, 0.42, 0.43, 0.72, 1], ease: "linear" },
          }}
        />
      ))}
      </svg>
    </svg>
  );
}
