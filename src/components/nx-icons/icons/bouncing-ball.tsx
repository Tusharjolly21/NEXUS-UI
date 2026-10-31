"use client";

import { motion, useReducedMotion } from "framer-motion";

export type BouncingBallIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Plays all the time. Pass false to hold it still. */
  play?: boolean;
};

/** A ball that falls, squashes on the ground and bounces back, with a shadow that follows. */
export function BouncingBallIcon({ size = 24, strokeWidth = 2, className, play }: BouncingBallIconProps) {
  const reduce = useReducedMotion();
  const on = !reduce && (play ?? true);
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
      aria-hidden="true"
    >
      <motion.ellipse
        cx="12"
        cy="21"
        ry="1"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { rx: [1.6, 5, 1.6], opacity: [0.1, 0.32, 0.1] } : { rx: 5, opacity: 0.32 }}
        transition={on ? { duration: 1, times: [0, 0.5, 1], ease: ["easeIn", "easeOut"], repeat: Infinity } : { duration: 0.3 }}
      />
      <motion.ellipse
        cx="12"
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={on ? { cy: [5, 16.6, 5], rx: [3.2, 3.2, 4.4, 3.2, 3.2], ry: [3.2, 3.2, 2.1, 3.2, 3.2] } : { cy: 16.6, rx: 3.2, ry: 3.2 }}
        transition={
          on
            ? {
                cy: { duration: 1, times: [0, 0.5, 1], ease: ["easeIn", "easeOut"], repeat: Infinity },
                rx: { duration: 1, times: [0, 0.46, 0.5, 0.56, 1], ease: "linear", repeat: Infinity },
                ry: { duration: 1, times: [0, 0.46, 0.5, 0.56, 1], ease: "linear", repeat: Infinity },
              }
            : { duration: 0.3 }
        }
      />
    </svg>
  );
}
