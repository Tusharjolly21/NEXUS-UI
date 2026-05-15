"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type NexusLoaderProps = {
  /** Pixel size of the SVG. The artwork is drawn on a 64×64 viewBox. */
  size?: number;
  /** Color of nodes + lines. Defaults to `currentColor`. */
  color?: string;
  /** Color of the pulsing nexus core. */
  accent?: string;
  /** Total cycle duration. Defaults to `1.8s`. */
  durationMs?: number;
  /** Accessible label announced to screen readers. */
  label?: string;
  className?: string;
};

/**
 * Nexus loader — Converge direction.
 *
 * Same primitives as `NexusMark`, but each outer ray + node pulses in sequence
 * and the core breathes between r=5 and r=6.5. CSS keyframes only — no JS,
 * no requestAnimationFrame, no hydration surprises. Honors
 * `prefers-reduced-motion` by pausing all animations.
 */
export function NexusLoader({
  size = 28,
  color = "currentColor",
  accent = "oklch(0.72 0.18 250)",
  durationMs = 1800,
  label = "Loading",
  className,
}: NexusLoaderProps) {
  const reactId = React.useId();
  const id = reactId.replace(/:/g, "");
  const dur = `${durationMs}ms`;

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex shrink-0", className)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="block"
      >
        <style>{`
          @keyframes nx-pulse-1-${id} { 0%,100% { opacity: 1 } 33% { opacity: .15 } 66% { opacity: .15 } }
          @keyframes nx-pulse-2-${id} { 0%,100% { opacity: .15 } 33% { opacity: 1 } 66% { opacity: .15 } }
          @keyframes nx-pulse-3-${id} { 0%,100% { opacity: .15 } 33% { opacity: .15 } 66% { opacity: 1 } }
          @keyframes nx-line-1-${id} { 0%,100% { stroke-dashoffset: 23 } 33% { stroke-dashoffset: 0 } 66% { stroke-dashoffset: 23 } }
          @keyframes nx-line-2-${id} { 0% { stroke-dashoffset: 30 } 33%,100% { stroke-dashoffset: 30 } 66% { stroke-dashoffset: 0 } }
          @keyframes nx-line-3-${id} { 0% { stroke-dashoffset: 30 } 66% { stroke-dashoffset: 0 } 100% { stroke-dashoffset: 30 } }
          @keyframes nx-core-${id} { 0%,100% { r: 5 } 50% { r: 6.5 } }
          @media (prefers-reduced-motion: reduce) {
            .nx-anim-${id} { animation: none !important; }
          }
        `}</style>

        <circle
          cx="32"
          cy="6"
          r="3"
          fill={color}
          className={`nx-anim-${id}`}
          style={{ animation: `nx-pulse-1-${id} ${dur} ease-in-out infinite` }}
        />
        <circle
          cx="6"
          cy="50"
          r="3"
          fill={color}
          className={`nx-anim-${id}`}
          style={{ animation: `nx-pulse-2-${id} ${dur} ease-in-out infinite` }}
        />
        <circle
          cx="58"
          cy="50"
          r="3"
          fill={color}
          className={`nx-anim-${id}`}
          style={{ animation: `nx-pulse-3-${id} ${dur} ease-in-out infinite` }}
        />

        <path
          d="M32 9 L32 32"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="23"
          className={`nx-anim-${id}`}
          style={{ animation: `nx-line-1-${id} ${dur} ease-in-out infinite` }}
        />
        <path
          d="M9 49 L32 32"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="30"
          className={`nx-anim-${id}`}
          style={{ animation: `nx-line-2-${id} ${dur} ease-in-out infinite` }}
        />
        <path
          d="M55 49 L32 32"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="30"
          className={`nx-anim-${id}`}
          style={{ animation: `nx-line-3-${id} ${dur} ease-in-out infinite` }}
        />

        <circle
          cx="32"
          cy="32"
          r="5"
          fill={accent}
          className={`nx-anim-${id}`}
          style={{ animation: `nx-core-${id} ${dur} ease-in-out infinite` }}
        />
        <circle
          cx="32"
          cy="32"
          r="5"
          fill="none"
          stroke={color}
          strokeWidth="1.25"
        />
      </svg>
    </span>
  );
}
