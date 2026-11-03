"use client";

import { motion, useReducedMotion } from "framer-motion";

export type InfinityIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #bf5af2. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** A figure-eight track with a bright segment that glides along it forever, trailing a fading tail. */
export function InfinityIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: InfinityIconProps) {
  const reduce = useReducedMotion();
  const on = !reduce && (play ?? true);
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
      aria-hidden="true"
    >
      <path d="M12 12C14.4 9.4 15.5 8 17.5 8a4 4 0 0 1 0 8c-2 0-3.1-1.4-5.5-4C9.6 9.4 8.5 8 6.5 8a4 4 0 0 0 0 8c2 0 3.1-1.4 5.5-4z" opacity="0.2" />
      {[
        { len: 0.42, op: 0.3 },
        { len: 0.26, op: 0.6 },
        { len: 0.12, op: 1 },
      ].map((s) => (
        <motion.path
          key={s.len}
          d="M12 12C14.4 9.4 15.5 8 17.5 8a4 4 0 0 1 0 8c-2 0-3.1-1.4-5.5-4C9.6 9.4 8.5 8 6.5 8a4 4 0 0 0 0 8c2 0 3.1-1.4 5.5-4z"
          stroke={accent}
          opacity={s.op}
          pathLength={1}
          strokeDasharray={`${s.len} ${(1 - s.len).toFixed(2)}`}
          initial={{ strokeDashoffset: on ? s.len : s.len - 0.3 }}
          animate={on ? { strokeDashoffset: [s.len, s.len - 1] } : { strokeDashoffset: s.len - 0.3 }}
          transition={on ? { duration: 1.5 / speed, ease: "linear", repeat: Infinity } : { duration: 0.3 / speed }}
        />
      ))}
    </svg>
  );
}
