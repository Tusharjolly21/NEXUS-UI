import * as React from "react";
import { NexusMark, type NexusMarkProps } from "@/components/brand/nexus-mark";
import { cn } from "@/lib/utils";

export type NexusLockupProps = {
  /** Size of the mark in px. */
  size?: number;
  /** Gap between the mark and the wordmark in px. */
  gap?: number;
  /** Mark/wordmark color (defaults to `currentColor`). */
  color?: string;
  /** Accent color for the nexus core. */
  accent?: string;
  /** Optional subtitle under the wordmark (e.g. "UI systems lab"). */
  subtitle?: string;
  /** Wordmark weight; 600 by default. */
  weight?: 500 | 600 | 700;
  /** Renders just the mark, without text. */
  iconOnly?: boolean;
  className?: string;
} & Pick<NexusMarkProps, "title">;

/**
 * Standard Nexus brand lockup: Converge mark + "NEXUS-UI" wordmark.
 *
 * Use anywhere a logo + product name is expected (header, footer, sidebar).
 * For favicons or square avatar uses, pass `iconOnly`.
 */
export function NexusLockup({
  size = 28,
  gap = 10,
  color = "currentColor",
  accent = "oklch(0.72 0.18 250)",
  subtitle,
  weight = 600,
  iconOnly,
  title,
  className,
}: NexusLockupProps) {
  if (iconOnly) {
    return (
      <NexusMark
        size={size}
        color={color}
        accent={accent}
        title={title ?? "Nexus-UI"}
        className={className}
      />
    );
  }

  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{ gap }}
    >
      <NexusMark
        size={size}
        color={color}
        accent={accent}
        title={title ?? "Nexus-UI"}
      />
      <span className="flex flex-col leading-tight">
        <span
          className="text-sm tracking-tight text-foreground"
          style={{ fontWeight: weight, letterSpacing: "0.01em" }}
        >
          Nexus-UI
        </span>
        {subtitle ? (
          <span className="text-[11px] text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
    </span>
  );
}
