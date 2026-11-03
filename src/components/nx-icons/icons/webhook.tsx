"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WebhookIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff453a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A hook between connected nodes: a pulse runs from the sender into the hook node, down the hook and out to the receiver, and each node answers with a ring. */
export function WebhookIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WebhookIconProps) {
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
      <g transform="translate(0 1.0)">
      <svg x="0" y="0" width="24" height="24" viewBox="0 0 24 24" overflow="hidden">
      <path d="M6.5 5.5H12" />
      <path d="M14 7.5V14a4.5 4.5 0 0 1-9 0v-2.5" />
      <path d="M3 13.3 5 11.3l2 2" />
      <path d="M14 12h3" />
      <motion.circle
        cx="4.5"
        cy="5.5"
        r="2"
        initial={false}
        animate={on ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.3 / speed }}
      />
      <motion.circle
        cx="14"
        cy="5.5"
        r="2"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1, 1.3, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.5 / speed, times: [0, 0.45, 0.7, 1] }}
      />
      <motion.circle
        cx="19"
        cy="12"
        r="2"
        initial={false}
        animate={on ? { scale: [1, 1, 1.3, 1] } : { scale: 1 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.5 / speed, delay: (on ? 0.4 : 0) / speed, times: [0, 0.45, 0.7, 1] }}
      />
      <motion.circle
        cx="14"
        cy="5.5"
        r="2"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1, 2.2], opacity: [0, 0.9, 0] } : { scale: 1, opacity: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.22 : 0) / speed, times: [0, 0.01, 1], ease: "easeOut" }}
      />
      <motion.circle
        cx="19"
        cy="12"
        r="2"
        stroke={accent}
        initial={false}
        animate={on ? { scale: [1, 1, 2.2], opacity: [0, 0.9, 0] } : { scale: 1, opacity: 0 }}
        style={{ originX: "50%", originY: "50%" }}
        transition={{ duration: 0.4 / speed, delay: (on ? 0.6 : 0) / speed, times: [0, 0.01, 1], ease: "easeOut" }}
      />
      <motion.path
        d="M6.5 5.5H12"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0.45, 0.45], pathOffset: [0, 0.55], opacity: [0, 1, 1, 0] } : { pathLength: 1, pathOffset: 0, opacity: 0 }}
        transition={{
          pathLength: { duration: 0.01 / speed },
          pathOffset: { duration: 0.26 / speed, ease: "easeInOut" },
          opacity: { duration: 0.26 / speed, times: [0, 0.15, 0.8, 1] },
        }}
      />
      <motion.path
        d="M14 7.5V14a4.5 4.5 0 0 1-9 0v-2.5"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0.3, 0.3], pathOffset: [0, 0.7], opacity: [0, 1, 1, 0] } : { pathLength: 1, pathOffset: 0, opacity: 0 }}
        transition={{
          pathLength: { duration: 0.01 / speed },
          pathOffset: { duration: 0.48 / speed, delay: (on ? 0.24 : 0) / speed, ease: "easeInOut" },
          opacity: { duration: 0.48 / speed, delay: (on ? 0.24 : 0) / speed, times: [0, 0.12, 0.85, 1] },
        }}
      />
      <motion.path
        d="M14 12h3"
        stroke={accent}
        initial={false}
        animate={on ? { pathLength: [0.6, 0.6], pathOffset: [0, 0.4], opacity: [0, 1, 1, 0] } : { pathLength: 1, pathOffset: 0, opacity: 0 }}
        transition={{
          pathLength: { duration: 0.01 / speed },
          pathOffset: { duration: 0.2 / speed, delay: (on ? 0.38 : 0) / speed, ease: "easeInOut" },
          opacity: { duration: 0.2 / speed, delay: (on ? 0.38 : 0) / speed, times: [0, 0.15, 0.8, 1] },
        }}
      />
      <motion.path
        d="M3 13.3 5 11.3l2 2"
        stroke={accent}
        initial={false}
        animate={on ? { opacity: [0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.35 / speed, delay: (on ? 0.62 : 0) / speed, ease: "easeOut" }}
      />
      </svg>
      </g>
    </svg>
  );
}
