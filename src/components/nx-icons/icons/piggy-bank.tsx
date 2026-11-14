"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type PiggyBankIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ff6482. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** A coin tumbles edge-on into the slot and vanishes behind the back line, the piggy squashes and wobbles, and a fresh coin pops back. */
export function PiggyBankIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: PiggyBankIconProps) {
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
      <g transform="translate(0.3 0)">
        <motion.g
          style={{ originX: "41.667%", originY: "92.708%" }}
          initial={false}
          animate={on ? { scaleY: [1, 1, 0.91, 1.04, 0.99, 1, 1], scaleX: [1, 1, 1.045, 0.98, 1.005, 1, 1] } : { scaleY: 1, scaleX: 1 }}
          transition={{ scaleY: { duration: 1.1 / speed, times: [0.0000, 0.4000, 0.4818, 0.6182, 0.7455, 0.8909, 1.0000], ease: ["linear", "easeOut", "easeInOut", "easeInOut", "easeInOut", "linear"] }, scaleX: { duration: 1.1 / speed, times: [0.0000, 0.4000, 0.4818, 0.6182, 0.7455, 0.8909, 1.0000], ease: ["linear", "easeOut", "easeInOut", "easeInOut", "easeInOut", "linear"] } }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <svg x="-2" y="-2" width="28" height="11.705" viewBox="-2 -2 28 11.705" overflow="hidden">
            <g transform="translate(9 3.456)">
              <motion.g
                initial={false}
                animate={on ? { y: [0, 0, 7.149, 7.149, 0, 0], scale: [1, 1, 0, 0, 1.15, 1, 1] } : { y: 0, scale: 1 }}
                transition={{ y: { duration: 1.1 / speed, times: [0.0000, 0.0909, 0.4000, 0.4545, 0.4636, 1.0000], ease: ["easeIn", "easeIn", "linear", "linear", "linear"] }, scale: { duration: 1.1 / speed, times: [0.0000, 0.4182, 0.4273, 0.6909, 0.8364, 0.9000, 1.0000], ease: ["linear", "linear", "linear", "easeOut", "easeInOut", "linear"] } }}
              >
                <rect x="-0.75" y="-1.7" width="1.5" height="3.4" rx="0.75" fill={accent} stroke="none" />
              </motion.g>
            </g>
          </svg>
          <motion.g
            style={{ originX: "17.409%", originY: "37.77%" }}
            initial={false}
            animate={on ? { rotate: [0, 0, -16, 12, -6, 0, 0] } : { rotate: 0 }}
            transition={{ duration: 1.1 / speed, times: [0.0000, 0.4182, 0.5000, 0.6000, 0.7091, 0.8364, 1.0000], ease: ["linear", "easeOut", "easeInOut", "easeInOut", "easeInOut", "linear"] }}
          >
            <rect width="24" height="24" fill="none" stroke="none" />
            <path d="M4.178 9.065 L3.407 8.145 A2.1 2.1 0 0 1 5.38 4.728" />
          </motion.g>
          <path d="M11.4 6.956 A7.6 6.2 0 0 1 17.309 11.35 H17.6 A3.4 3.4 0 0 1 17.6 18.15 H14.322 A7.6 6.2 0 1 1 6.6 7.505 V9.705 H11.4 V6.956 Z" />
          <path d="M14 7.778 L15.3 4.981 L15.8 9.043" />
          <path d="M6.4 18.51 V21.25 M11.6 19.111 V21.25" />
          <path d="M17.6 13.7 h.01 M17.6 15.8 h.01" strokeWidth={strokeWidth * 0.75} />
          <path d="M14.2 11.45 h.01" strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </g>
    </svg>
  );
}
