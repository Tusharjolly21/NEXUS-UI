"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

export type IconMaterialName = "line" | "spark" | "neon" | "aurora" | "chrome" | "mercury" | "liquid" | "glass";

/**
 * Looks for the icons: wrap one icon, or a whole grid of them, and they all take on the same finish.
 *
 *   line     plain strokes in the current colour (the default; nothing is added)
 *   spark    strokes in the current colour, with each icon's small accent details in colour:
 *            give the icons an `accent`, e.g. <BellIcon accent="#ff3b30" />
 *   neon     a glow around every stroke, in the current colour
 *   aurora   every stroke painted with a blue-to-orange spectrum
 *   chrome   every stroke painted as polished metal (looks best on a dark background)
 *   mercury  liquid metal: the strokes round and thicken into a lit tube, and a reflected room of light and
 *            dark bands flows slowly along them (best on a dark background)
 *   liquid   the strokes in the current colour as a wet droplet: where they touch they melt together, with a
 *            glossy highlight, and the whole icon wobbles like jelly while the pointer is over it
 *   glass    clear glass: a translucent body with a bright edge, a fringe of red and blue where the lens bends
 *            the light, and a sheen that drifts across (best on a dark or colourful background)
 *
 * It only restyles, so it works with any icon that draws in currentColor and has a 24-unit viewBox. The three
 * liquid looks are pure SVG (gradients and filters): no canvas, no WebGL, nothing to load, and they hold still
 * for visitors who have reduced motion switched on.
 */

const AURORA: [string, string][] = [["0", "#0090f7"], ["0.3", "#6e5bff"], ["0.55", "#ba62fc"], ["0.78", "#f2416b"], ["1", "#f55600"]];
const CHROME: [string, string][] = [["0", "#f4f5fb"], ["0.22", "#9ea3b6"], ["0.38", "#ffffff"], ["0.55", "#6d7183"], ["0.72", "#e8e9f2"], ["0.84", "#ffe3b8"], ["1", "#bfc3d4"]];
// The room mercury reflects, as one stripe of light: bright sky, soft grey, two hard dark bands and a warm window.
// It starts and ends on the same colour so it can repeat and flow without a seam.
const MERCURY: [string, string][] = [
  ["0", "#f6f7fc"], ["0.12", "#d6d9e8"], ["0.26", "#8e93aa"], ["0.32", "#262833"], ["0.4", "#a4a9bf"], ["0.52", "#ffffff"],
  ["0.6", "#646a80"], ["0.65", "#1c1e27"], ["0.73", "#cdd1e3"], ["0.85", "#ffe8c0"], ["1", "#f6f7fc"],
];
const GLASS: [string, string, number][] = [["0", "#ffffff", 0.95], ["0.35", "#e6f0ff", 0.55], ["0.7", "#cfe0ff", 0.3], ["1", "#ffffff", 0.7]];

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
  const reduce = useReducedMotion();
  const flat = material === "aurora" || material === "chrome";
  const stops = material === "aurora" ? AURORA : CHROME;
  const liquidish = material === "mercury" || material === "liquid" || material === "glass";

  // An inline <style> (not a class in a stylesheet), so that url(#…) points into this page's own document.
  // Filters go on each top-level shape of an icon (not the <svg>), so their units are the icon's own 24-unit grid
  // and a look is the same size-for-size at 16px or 160px.
  let css = "";
  if (material === "neon") {
    css = `.${scope} svg{filter:drop-shadow(0 0 1.5px currentColor) drop-shadow(0 0 6px currentColor)}`;
  } else if (flat) {
    css =
      `.${scope} svg *:not([stroke="none"]){stroke:url(#${scope}) !important}` +
      `.${scope} svg *[fill]:not([fill="none"]){fill:url(#${scope}) !important}` +
      (material === "chrome" ? `.${scope} svg{filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}` : "");
  } else if (liquidish) {
    css =
      `.${scope} svg *:not([stroke="none"]){stroke:url(#${scope}) !important}` +
      `.${scope} svg *[fill]:not([fill="none"]){fill:url(#${scope}) !important}` +
      `.${scope} svg>*:not(defs){filter:url(#${scope}-f)}` +
      (material === "liquid" && !reduce ? `.${scope} svg:hover>*:not(defs){filter:url(#${scope}-w)}` : "");
  }

  const flow = !reduce && (material === "mercury" || material === "glass");

  return (
    <div className={[scope, className].filter(Boolean).join(" ")} style={{ color, ...style }} data-material={material}>
      {css ? <style>{css}</style> : null}
      {flat ? (
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

      {material === "mercury" ? (
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }} focusable="false">
          <defs>
            {/* one stripe of reflected room, repeated, so sliding it by one period loops without a seam */}
            <linearGradient id={scope} gradientUnits="userSpaceOnUse" x1="0" y1="24" x2="24" y2="0" spreadMethod="repeat">
              {MERCURY.map(([offset, c]) => (
                <stop key={offset} offset={offset} stopColor={c} />
              ))}
              {flow ? <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="24 -24" dur="7s" repeatCount="indefinite" /> : null}
            </linearGradient>
            <filter id={`${scope}-f`} filterUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32" colorInterpolationFilters="sRGB">
              {/* round the strokes off and let touching ones melt together */}
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="soft" />
              <feColorMatrix in="soft" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 16 -6" result="shape" />
              {/* a smooth height map of that shape, lit from the top left like a tube of metal */}
              <feGaussianBlur in="shape" stdDeviation="0.65" result="relief" />
              <feSpecularLighting in="relief" surfaceScale="2.6" specularConstant="1.2" specularExponent="28" lightingColor="#ffffff" result="shine">
                <fePointLight x="3" y="0" z="13" />
              </feSpecularLighting>
              <feComposite in="shine" in2="shape" operator="in" result="glint" />
              <feComposite in="SourceGraphic" in2="shape" operator="in" result="body" />
              <feComposite in="body" in2="glint" operator="arithmetic" k1="0" k2="1" k3="0.9" k4="0" result="lit" />
              <feDropShadow in="lit" dx="0" dy="0.5" stdDeviation="0.45" floodColor="#000000" floodOpacity="0.42" />
            </filter>
          </defs>
        </svg>
      ) : null}

      {material === "liquid" ? (
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }} focusable="false">
          <defs>
            <linearGradient id={scope} gradientUnits="userSpaceOnUse" x1="3" y1="3" x2="21" y2="21">
              <stop offset="0" stopColor="currentColor" style={{ stopColor: "color-mix(in srgb, currentColor 55%, white)" }} />
              <stop offset="0.5" stopColor="currentColor" />
              <stop offset="1" stopColor="currentColor" style={{ stopColor: "color-mix(in srgb, currentColor 70%, black)" }} />
            </linearGradient>
            <filter id={`${scope}-f`} filterUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32" colorInterpolationFilters="sRGB">
              <LiquidCore wobble={false} />
            </filter>
            <filter id={`${scope}-w`} filterUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32" colorInterpolationFilters="sRGB">
              <LiquidCore wobble />
            </filter>
          </defs>
        </svg>
      ) : null}

      {material === "glass" ? (
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }} focusable="false">
          <defs>
            <linearGradient id={scope} gradientUnits="userSpaceOnUse" x1="0" y1="24" x2="24" y2="0" spreadMethod="repeat">
              {GLASS.map(([offset, c, o]) => (
                <stop key={offset} offset={offset} stopColor={c} stopOpacity={o} />
              ))}
              {flow ? <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="24 -24" dur="9s" repeatCount="indefinite" /> : null}
            </linearGradient>
            <filter id={`${scope}-f`} filterUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32" colorInterpolationFilters="sRGB">
              {/* a bright rim where the glass catches the light */}
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.3" result="soft" />
              <feSpecularLighting in="soft" surfaceScale="2" specularConstant="1" specularExponent="13" lightingColor="#ffffff" result="rim">
                <fePointLight x="2" y="0" z="9" />
              </feSpecularLighting>
              <feComposite in="rim" in2="SourceAlpha" operator="in" result="edge" />
              {/* the lens bends red and blue light apart: a fringe on each side of every stroke */}
              <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
              <feOffset in="red" dx="-0.32" dy="0" result="redShift" />
              <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
              <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
              <feOffset in="blue" dx="0.32" dy="0" result="blueShift" />
              <feBlend in="redShift" in2="green" mode="screen" result="rg" />
              <feBlend in="rg" in2="blueShift" mode="screen" result="split" />
              <feComposite in="edge" in2="split" operator="arithmetic" k1="0" k2="0.9" k3="1" k4="0" result="glass" />
              <feDropShadow in="glass" dx="0" dy="0.6" stdDeviation="0.55" floodColor="#0a1030" floodOpacity="0.5" />
            </filter>
          </defs>
        </svg>
      ) : null}

      {children}
    </div>
  );
}

/** The shared part of the liquid filter: melt, light, and (on hover) a slow jelly wobble. */
function LiquidCore({ wobble }: { wobble: boolean }) {
  return (
    <>
      {wobble ? (
        <>
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.07" numOctaves="1" seed="3" result="noise">
            <animate attributeName="baseFrequency" values="0.05 0.07;0.08 0.05;0.05 0.07" dur="2.6s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.1" xChannelSelector="R" yChannelSelector="G" result="wobbled" />
        </>
      ) : null}
      <feGaussianBlur in={wobble ? "wobbled" : "SourceGraphic"} stdDeviation="0.7" result="soft" />
      <feColorMatrix in="soft" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="melted" />
      <feGaussianBlur in="melted" stdDeviation="0.7" result="relief" />
      <feSpecularLighting in="relief" surfaceScale="3" specularConstant="1.3" specularExponent="18" lightingColor="#ffffff" result="wet">
        <fePointLight x="4" y="0" z="10" />
      </feSpecularLighting>
      <feComposite in="wet" in2="melted" operator="in" result="gloss" />
      <feComposite in="melted" in2="gloss" operator="arithmetic" k1="0" k2="1" k3="0.95" k4="0" result="lit" />
      <feDropShadow in="lit" dx="0" dy="0.55" stdDeviation="0.5" floodColor="currentColor" floodOpacity="0.45" />
    </>
  );
}
