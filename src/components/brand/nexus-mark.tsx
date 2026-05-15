import * as React from "react";
import { cn } from "@/lib/utils";

export type NexusMarkProps = {
  /** Pixel size of the SVG. The artwork is drawn on a 64×64 viewBox. */
  size?: number;
  /** Color of nodes + lines. Defaults to `currentColor` so it adapts to dark/light. */
  color?: string;
  /** Color of the converging nexus core. */
  accent?: string;
  /** If true, exposes the mark to assistive tech with the given label. */
  title?: string;
  className?: string;
};

/**
 * Nexus mark — Converge direction.
 *
 * Three outer nodes (top, lower-left, lower-right) meet at a luminous accent
 * core via three converging strokes. The artwork is intentionally pixel-aligned
 * to the 64×64 grid so it stays crisp at 16/24/32/48/64 px.
 */
export function NexusMark({
  size = 28,
  color = "currentColor",
  accent = "oklch(0.72 0.18 250)",
  title,
  className,
}: NexusMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("block shrink-0", className)}
    >
      <circle cx="32" cy="6" r="3" fill={color} />
      <circle cx="6" cy="50" r="3" fill={color} />
      <circle cx="58" cy="50" r="3" fill={color} />

      <path
        d="M32 9 L32 32 M9 49 L32 32 M55 49 L32 32"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <circle cx="32" cy="32" r="5" fill={accent} />
      <circle
        cx="32"
        cy="32"
        r="5"
        fill="none"
        stroke={color}
        strokeWidth="1.25"
      />
    </svg>
  );
}
