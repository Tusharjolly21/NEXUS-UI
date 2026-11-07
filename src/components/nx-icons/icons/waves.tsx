"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WavesIconProps = {
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

/** Three rows of waves that roll sideways one after another. */
export function WavesIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: WavesIconProps) {
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
      {[0, 1, 2].map((row) => {
        const ym = 6.5 + row * 5.5;
        const wave = (ph: number) => {
          const k = (2 * Math.PI) / 6.2;
          let d = "";
          let px = 0;
          let py = 0;
          let ps = 0;
          for (let i = 0; i <= 24; i++) {
            const x = 2.7 + (18.6 * i) / 24;
            const a = k * (x - 2.7) - ph;
            const y = ym - 1.8 * Math.sin(a);
            const s = -1.8 * k * Math.cos(a);
            if (i === 0) {
              d = `M${x.toFixed(2)} ${y.toFixed(2)}`;
            } else {
              const dx = x - px;
              d += `C${(px + dx / 3).toFixed(2)} ${(py + (ps * dx) / 3).toFixed(2)} ${(x - dx / 3).toFixed(2)} ${(y - (s * dx) / 3).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
            }
            px = x;
            py = y;
            ps = s;
          }
          return d;
        };
        return (
          <motion.path
            key={row}
            d={wave(0)}
            stroke={row === 1 ? accent : "currentColor"}
            initial={false}
            animate={on ? { d: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((j) => wave((j * Math.PI) / 4)) } : { d: wave(0) }}
            transition={{ duration: 0.7 / speed, delay: (on ? row * 0.14 : 0) / speed, ease: "linear" }}
          />
        );
      })}
    </svg>
  );
}
