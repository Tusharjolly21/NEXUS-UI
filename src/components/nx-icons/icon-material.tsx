"use client";

import { useId, type CSSProperties, type ReactNode } from "react";

export type IconMaterialName = "line" | "spark" | "neon" | "aurora" | "chrome";

/**
 * Looks for the icons: wrap one icon, or a whole grid of them, and they all take on the same finish.
 *
 *   line    plain strokes in the current colour (the default; nothing is added)
 *   spark   strokes in the current colour, with each icon's small accent details in colour:
 *           give the icons an `accent`, e.g. <BellIcon accent="#ff3b30" />
 *   neon    a glow around every stroke, in the current colour
 *   aurora  every stroke painted with a blue-to-orange spectrum
 *   chrome  every stroke painted as polished metal (looks best on a dark background)
 *
 * It only restyles, so it works with any icon that draws in currentColor and has a 24-unit viewBox.
 */

const AURORA: [string, string][] = [["0", "#0090f7"], ["0.3", "#6e5bff"], ["0.55", "#ba62fc"], ["0.78", "#f2416b"], ["1", "#f55600"]];
const CHROME: [string, string][] = [["0", "#f4f5fb"], ["0.22", "#9ea3b6"], ["0.38", "#ffffff"], ["0.55", "#6d7183"], ["0.72", "#e8e9f2"], ["0.84", "#ffe3b8"], ["1", "#bfc3d4"]];

export function IconMaterial({
  material = "line",
  color,
  className,
  style,
  children,
}: {
  material?: IconMaterialName;
  /** The current colour for everything inside. Left out, it inherits. */
  color?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const scope = `nx-mat-${uid}`;
  const gradient = material === "aurora" || material === "chrome";
  const stops = material === "aurora" ? AURORA : CHROME;

  // An inline <style> (not a class in a stylesheet), so that url(#…) points into this page's own document.
  let css = "";
  if (material === "neon") {
    css = `.${scope} svg{filter:drop-shadow(0 0 1.5px currentColor) drop-shadow(0 0 6px currentColor)}`;
  } else if (gradient) {
    css =
      `.${scope} svg *:not([stroke="none"]){stroke:url(#${scope}) !important}` +
      `.${scope} svg *[fill]:not([fill="none"]){fill:url(#${scope}) !important}` +
      (material === "chrome" ? `.${scope} svg{filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}` : "");
  }

  return (
    <div className={[scope, className].filter(Boolean).join(" ")} style={{ color, ...style }} data-material={material}>
      {css ? <style>{css}</style> : null}
      {gradient ? (
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }} focusable="false">
          <defs>
            <linearGradient id={scope} gradientUnits="userSpaceOnUse" x1="3" y1="21" x2="21" y2="3">
              {stops.map(([offset, c]) => (
                <stop key={offset} offset={offset} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
        </svg>
      ) : null}
      {children}
    </div>
  );
}
