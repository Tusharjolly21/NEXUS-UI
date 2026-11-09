"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WheatIconProps = {
  /** Width and height in pixels. */
  size?: number;
  /** Line thickness, in a drawing that is 24 units wide. */
  strokeWidth?: number;
  className?: string;
  /** Playback speed: 1 is the designed pace, 2 is twice as fast. */
  speed?: number;
  /** Colour of the icon's accent details, such as #ffd60a. Defaults to the icon's own colour. */
  accent?: string;
  /** Plays (true) or rests (false). Left out, it plays while the pointer is over it. */
  play?: boolean;
};

/** An ear of wheat that sways in the wind while its grains flick in turn. */
export function WheatIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WheatIconProps) {
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
      <motion.g
        style={{ originX: "50%", originY: "87.92%" }}
        initial={false}
        animate={on ? { rotate: [0, 7, -6, 3, 0] } : { rotate: 0 }}
        transition={{ duration: 0.9 / speed, ease: "easeInOut" }}
      >
        <rect width="24" height="24" fill="none" stroke="none" />
        <path d="M12 21.1V6.6" />
        <motion.g
          style={{ originX: "50%", originY: "78.75%" }}
          initial={false}
          animate={on ? { rotate: [0, -11, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.23) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 18.9Q11.64 16.26 9.06 15.63Q9.41 18.27 12 18.9z" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "78.75%" }}
          initial={false}
          animate={on ? { rotate: [0, 11, -6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.23) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 18.9Q14.59 18.27 14.94 15.63Q12.36 16.26 12 18.9z" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "61.67%" }}
          initial={false}
          animate={on ? { rotate: [0, -11, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.17) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 14.8Q11.64 12.16 9.06 11.53Q9.41 14.17 12 14.8z" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "61.67%" }}
          initial={false}
          animate={on ? { rotate: [0, 11, -6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.17) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 14.8Q14.59 14.17 14.94 11.53Q12.36 12.16 12 14.8z" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "44.58%" }}
          initial={false}
          animate={on ? { rotate: [0, -11, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.11) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 10.7Q11.64 8.06 9.06 7.43Q9.41 10.07 12 10.7z" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "44.58%" }}
          initial={false}
          animate={on ? { rotate: [0, 11, -6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.11) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 10.7Q14.59 10.07 14.94 7.43Q12.36 8.06 12 10.7z" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
        <motion.g
          style={{ originX: "50%", originY: "27.5%" }}
          initial={false}
          animate={on ? { rotate: [0, 11, -6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.8 / speed, delay: (0.05) / speed, ease: "easeInOut" }}
        >
          <rect width="24" height="24" fill="none" stroke="none" />
          <path d="M12 6.6Q13.5 4.5 12 2.4Q10.5 4.5 12 6.6z" stroke={accent} strokeWidth={strokeWidth * 0.75} />
        </motion.g>
      </motion.g>
    </svg>
  );
}
