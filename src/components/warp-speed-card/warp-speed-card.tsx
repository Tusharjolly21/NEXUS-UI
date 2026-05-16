"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Beams sized for the inline text region (~200-300px wide, ~50-70px tall)
const BEAMS = [
  { y: "8%",  length: 60,  thickness: 1, opacity: 0.9,  delay: 0,    duration: 0.46 },
  { y: "20%", length: 95,  thickness: 1, opacity: 0.55, delay: 0.1,  duration: 0.7  },
  { y: "30%", length: 45,  thickness: 1, opacity: 1.0,  delay: 0.04, duration: 0.4  },
  { y: "42%", length: 115, thickness: 2, opacity: 0.42, delay: 0.18, duration: 0.86 },
  { y: "55%", length: 65,  thickness: 1, opacity: 0.85, delay: 0.08, duration: 0.48 },
  { y: "66%", length: 100, thickness: 1, opacity: 0.5,  delay: 0.22, duration: 0.78 },
  { y: "78%", length: 50,  thickness: 1, opacity: 0.92, delay: 0.12, duration: 0.44 },
  { y: "90%", length: 85,  thickness: 2, opacity: 0.6,  delay: 0.06, duration: 0.66 },
] as const;

const STARS = [
  { x: 14, y: 22, r: 1,   delay: 0.1 },
  { x: 36, y: 62, r: 1,   delay: 0.4 },
  { x: 58, y: 16, r: 1.5, delay: 0.7 },
  { x: 76, y: 76, r: 1,   delay: 0.2 },
  { x: 50, y: 45, r: 1,   delay: 0.55 },
  { x: 88, y: 38, r: 1,   delay: 0.35 },
] as const;

export interface WarpSpeedCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Outer card container — just a styled wrapper. */
export function WarpSpeedCard({
  children,
  className,
  contentClassName,
}: WarpSpeedCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-white", className)}>
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  );
}

export interface WarpTextTriggerProps {
  children: React.ReactNode;
  className?: string;
  /** RGB triplet for beam color, e.g. "255,255,255" for white */
  beamColor?: string;
}

/**
 * Inline warp-speed effect. Wrap a phrase to reveal — on hover — a contained
 * space scene with streaking beams that stays confined to the text's bounding
 * box. The text itself does not shrink or animate.
 */
export function WarpTextTrigger({
  children,
  className,
  beamColor = "255,255,255",
}: WarpTextTriggerProps) {
  const [hovered, setHovered] = useState(false);

  const handleBorder = hovered ? "rgba(148,163,184,0.8)" : "rgb(59,130,246)";
  const handleFill = hovered ? "rgb(24,24,27)" : "white";
  const boxBorder = hovered ? "rgba(148,163,184,0.5)" : "rgba(59,130,246,0.5)";

  return (
    <span
      className={cn("relative inline-block cursor-default select-none align-baseline", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Confined warp scene — sits directly behind the text, clipped to the box */}
      <span className="pointer-events-none absolute -inset-1 overflow-hidden" aria-hidden>
        {/* Dark space background */}
        <motion.span
          className="absolute inset-0 block bg-zinc-950"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
        {/* Stars */}
        {STARS.map((s, i) => (
          <motion.span
            key={`s-${i}`}
            className="absolute block rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r }}
            animate={hovered ? { opacity: [0, 1, 0.3, 1, 0] } : { opacity: 0 }}
            transition={
              hovered
                ? { duration: 2.6, delay: s.delay, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
          />
        ))}
        {/* Warp beams */}
        {BEAMS.map((beam, i) => (
          <motion.span
            key={`b-${i}`}
            className="absolute block"
            style={{
              left: 0,
              top: beam.y,
              height: beam.thickness,
              width: beam.length,
              background: `linear-gradient(90deg, transparent 0%, rgba(${beamColor},0.75) 38%, rgba(${beamColor},1) 50%, rgba(${beamColor},0.75) 62%, transparent 100%)`,
            }}
            initial={{ x: -160, opacity: 0 }}
            animate={
              hovered
                ? { x: [-160, 700], opacity: [0, beam.opacity, beam.opacity, 0] }
                : { x: -160, opacity: 0 }
            }
            transition={
              hovered
                ? {
                    duration: beam.duration,
                    delay: beam.delay,
                    repeat: Infinity,
                    ease: [0.18, 0.52, 0.82, 1],
                    times: [0, 0.08, 0.92, 1],
                  }
                : { duration: 0.2 }
            }
          />
        ))}
      </span>

      {/* Static text on top — color flips so it stays legible on dark bg */}
      <motion.span
        className="relative inline-block px-0.5"
        animate={{ color: hovered ? "rgb(255,255,255)" : "rgb(17,24,39)" }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.span>

      {/* Figma-style selection handles */}
      <span className="pointer-events-none absolute -inset-1" aria-hidden>
        <span className="absolute inset-0 border" style={{ borderColor: boxBorder }} />
        <span
          className="absolute -top-0.75 -left-0.75 size-1.5 border"
          style={{ borderColor: handleBorder, backgroundColor: handleFill }}
        />
        <span
          className="absolute -top-0.75 -right-0.75 size-1.5 border"
          style={{ borderColor: handleBorder, backgroundColor: handleFill }}
        />
        <span
          className="absolute -bottom-0.75 -left-0.75 size-1.5 border"
          style={{ borderColor: handleBorder, backgroundColor: handleFill }}
        />
        <span
          className="absolute -bottom-0.75 -right-0.75 size-1.5 border"
          style={{ borderColor: handleBorder, backgroundColor: handleFill }}
        />
      </span>
    </span>
  );
}
