import { cn } from "@/lib/utils";

/** The six hues of the Playground palette, in letter order. */
export const RAINBOW_HUES = ["#0a7aff", "#34c759", "#ff7a1a", "#ffc800", "#ff3b8d", "#8b5cf6"] as const;

/**
 * One word or short line set in rainbow letters. Use at most once per page.
 * Letters are server-rendered (visible without JS) and drop in with a squash;
 * screen readers get the plain text.
 */
export function RainbowWord({
  children,
  className,
  delay = 0.25,
}: {
  children: string;
  className?: string;
  /** Seconds before the first letter drops in. */
  delay?: number;
}) {
  let hue = 0;
  return (
    <span className={cn("whitespace-nowrap", className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden>
        {Array.from(children).map((char, i) =>
          char === " " ? (
            <span key={i}>&nbsp;</span>
          ) : (
            <span
              key={i}
              className="pg-rainbow-letter"
              style={{ color: RAINBOW_HUES[hue++ % RAINBOW_HUES.length], animationDelay: `${delay + i * 0.06}s` }}
            >
              {char}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
