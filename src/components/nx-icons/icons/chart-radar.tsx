"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ChartRadarIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** The data shape on a five-sided web reshapes itself twice, each vertex sliding along its spoke. */
export function ChartRadarIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: ChartRadarIconProps) {
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
      <path d="M12 12.92L12 3.32M12 12.92L21.13 9.95M12 12.92L17.64 20.68M12 12.92L6.36 20.68M12 12.92L2.87 9.95" strokeWidth={strokeWidth * 0.5} strokeOpacity={0.45} />
      <path d="M12 8.12L16.57 11.43L14.82 16.8L9.18 16.8L7.43 11.43Z" strokeWidth={strokeWidth * 0.5} strokeOpacity={0.45} />
      <motion.path
        d="M12 6.02L16.95 11.31L15.88 18.26L9.41 16.48L6.29 11.06Z"
        stroke={accent}
        strokeWidth={strokeWidth * 0.75}
        fill={accent}
        fillOpacity={0.22}
        initial={false}
        animate={on ? { d: ["M12 6.02L16.95 11.31L15.88 18.26L9.41 16.48L6.29 11.06Z", "M12 8.52L18.56 10.78L14.94 16.96L8.18 18.18L8.01 11.62Z", "M12 6.02L17.52 11.12L14.35 16.15L8.06 18.34L6.86 11.25Z", "M12 6.02L16.95 11.31L15.88 18.26L9.41 16.48L6.29 11.06Z"] } : { d: "M12 6.02L16.95 11.31L15.88 18.26L9.41 16.48L6.29 11.06Z" }}
        transition={{ duration: 1 / speed, times: [0, 0.33, 0.66, 1], ease: "easeInOut" }}
      />
      <path d="M12 3.32L21.13 9.95L17.64 20.68L6.36 20.68L2.87 9.95Z" />
    </svg>
  );
}
