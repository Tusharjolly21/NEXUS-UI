"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SpiderwebIconProps = {
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

/** A spider abseils from the hub on a silk thread, bounces at the end of it and climbs back up. */
export function SpiderwebIcon({ size = 24, strokeWidth = 2, className, speed = 1, accent = "currentColor", play }: SpiderwebIconProps) {
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
      <motion.path
        d="M12 12V12"
        stroke={accent}
        strokeWidth={strokeWidth * 0.5}
        initial={false}
        animate={on ? { d: ["M12 12V12", "M12 12V21.8", "M12 12V20.6", "M12 12V21.8", "M12 12V12"] } : { d: "M12 12V12" }}
        transition={{ duration: 1 / speed, times: [0, 0.35, 0.5, 0.62, 1], ease: "easeInOut" }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="1.3"
        fill={accent}
        stroke="none"
        initial={false}
        animate={on ? { y: [0, 9.8, 8.6, 9.8, 0] } : { y: 0 }}
        transition={{ duration: 1 / speed, times: [0, 0.35, 0.5, 0.62, 1], ease: "easeInOut" }}
      />
      <path d="M15.14 13.3Q13.8 13.8 13.3 15.14Q12 14.54 10.7 15.14Q10.2 13.8 8.86 13.3Q9.46 12 8.86 10.7Q10.2 10.2 10.7 8.86Q12 9.46 13.3 8.86Q13.8 10.2 15.14 10.7Q14.54 12 15.14 13.3ZM18.01 14.49Q15.54 15.54 14.49 18.01Q12 17.01 9.51 18.01Q8.46 15.54 5.99 14.49Q6.99 12 5.99 9.51Q8.46 8.46 9.51 5.99Q12 6.99 14.49 5.99Q15.54 8.46 18.01 9.51Q17.01 12 18.01 14.49ZM20.87 15.67Q17.35 17.35 15.67 20.87Q12 19.57 8.33 20.87Q6.65 17.35 3.13 15.67Q4.43 12 3.13 8.33Q6.65 6.65 8.33 3.13Q12 4.43 15.67 3.13Q17.35 6.65 20.87 8.33Q19.57 12 20.87 15.67ZM15.14 13.3L20.87 15.67M13.3 15.14L15.67 20.87M10.7 15.14L8.33 20.87M8.86 13.3L3.13 15.67M8.86 10.7L3.13 8.33M10.7 8.86L8.33 3.13M13.3 8.86L15.67 3.13M15.14 10.7L20.87 8.33" strokeWidth={strokeWidth * 0.75} />
    </svg>
  );
}
