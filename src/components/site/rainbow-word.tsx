import { cn } from "@/lib/utils";

/** Stops of the spectrum the letters are sampled from, left to right (blue → violet → pink → orange). */
export const RAINBOW_HUES = ["#0090f7", "#6e5bff", "#ba62fc", "#f2416b", "#f55600"] as const;

function hexToRgb(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

/** The colour at position t (0–1) along the spectrum. */
function sample(t: number) {
  const span = RAINBOW_HUES.length - 1;
  const x = Math.min(span, Math.max(0, t * span));
  const i = Math.min(span - 1, Math.floor(x));
  const f = x - i;
  const a = hexToRgb(RAINBOW_HUES[i]);
  const b = hexToRgb(RAINBOW_HUES[i + 1]);
  const mix = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgb(${mix[0]} ${mix[1]} ${mix[2]})`;
}

/**
 * One word or short line set as a continuous spectrum, each letter sampled from it so the
 * letters can still drop in one by one. Use at most once per page.
 * Letters are server-rendered (visible without JS); screen readers get the plain text.
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
  const chars = Array.from(children);
  const last = Math.max(1, chars.length - 1);
  return (
    <span className={cn("whitespace-nowrap", className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden>
        {chars.map((char, i) =>
          char === " " ? (
            <span key={i}>&nbsp;</span>
          ) : (
            <span
              key={i}
              className="pg-rainbow-letter"
              style={{ color: sample(i / last), animationDelay: `${delay + i * 0.06}s` }}
            >
              {char}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
