"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────
// Converge loader — exact translation of the design's LoaderConverge.
// Three outer nodes pulse in sequence; hairline rays draw in toward
// the luminous accent core. CSS-only, no JS timers, no hydration
// mismatch. Unique id suffix keeps keyframes isolated per instance.
// ─────────────────────────────────────────────────────────────────
function ConvergeLoader({
  size = 120,
  color = "var(--foreground)",
  accent = "oklch(0.86 0.13 215)",
  dur = "1.8s",
  id = "splash",
}: {
  size?: number;
  color?: string;
  accent?: string;
  dur?: string;
  id?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: "block" }}
    >
      <style>{`
        @keyframes nxs-p1-${id} { 0%,100%{opacity:1} 33%{opacity:.12} 66%{opacity:.12} }
        @keyframes nxs-p2-${id} { 0%,100%{opacity:.12} 33%{opacity:1} 66%{opacity:.12} }
        @keyframes nxs-p3-${id} { 0%,100%{opacity:.12} 33%{opacity:.12} 66%{opacity:1} }
        @keyframes nxs-l1-${id} { 0%,100%{stroke-dashoffset:23} 33%{stroke-dashoffset:0} 66%{stroke-dashoffset:23} }
        @keyframes nxs-l2-${id} { 0%{stroke-dashoffset:30} 33%,100%{stroke-dashoffset:30} 66%{stroke-dashoffset:0} }
        @keyframes nxs-l3-${id} { 0%{stroke-dashoffset:30} 66%{stroke-dashoffset:0} 100%{stroke-dashoffset:30} }
        @keyframes nxs-core-${id} { 0%,100%{r:5} 50%{r:6.5} }
        @media(prefers-reduced-motion:reduce){.nxs-a-${id}{animation:none!important}}
      `}</style>

      {/* outer triad nodes */}
      <circle cx="32" cy="6"  r="3" fill={color} className={`nxs-a-${id}`}
        style={{ animation: `nxs-p1-${id} ${dur} ease-in-out infinite` }} />
      <circle cx="6"  cy="50" r="3" fill={color} className={`nxs-a-${id}`}
        style={{ animation: `nxs-p2-${id} ${dur} ease-in-out infinite` }} />
      <circle cx="58" cy="50" r="3" fill={color} className={`nxs-a-${id}`}
        style={{ animation: `nxs-p3-${id} ${dur} ease-in-out infinite` }} />

      {/* converging rays */}
      <path d="M32 9 L32 32" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="23" className={`nxs-a-${id}`}
        style={{ animation: `nxs-l1-${id} ${dur} ease-in-out infinite` }} />
      <path d="M9 49 L32 32" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="30" className={`nxs-a-${id}`}
        style={{ animation: `nxs-l2-${id} ${dur} ease-in-out infinite` }} />
      <path d="M55 49 L32 32" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="30" className={`nxs-a-${id}`}
        style={{ animation: `nxs-l3-${id} ${dur} ease-in-out infinite` }} />

      {/* luminous nexus core */}
      <circle cx="32" cy="32" fill={accent} className={`nxs-a-${id}`}
        style={{ animation: `nxs-core-${id} ${dur} ease-in-out infinite` }}>
        <animate attributeName="r" values="5;6.5;5" dur={dur} repeatCount="indefinite" />
      </circle>
      <circle cx="32" cy="32" r="5" fill="none" stroke={color} strokeWidth="1.25" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// NexusSplash — fullscreen initial-load overlay.
// Matches the design system: deep ink (#08080A), warm paper (#ECE7DF),
// cool-cyan accent, Geist Mono wordmark, subtle SVG grain.
// Fades out 400ms after window.onload (min 800ms displayed).
// ─────────────────────────────────────────────────────────────────
export function NexusSplash() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    const MIN_MS = 900;
    const mountedAt = Date.now();

    const dismiss = () => {
      const elapsed = Date.now() - mountedAt;
      const wait = Math.max(0, MIN_MS - elapsed);
      setTimeout(() => setPhase("fading"), wait);
      setTimeout(() => setPhase("gone"), wait + 600);
    };

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss, { once: true });
      return () => window.removeEventListener("load", dismiss);
    }
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      role="status"
      aria-label="Loading Nexus UI"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 600ms cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      {/* SVG grain overlay — same technique as the design file */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.93 0 0 0 0 0.91 0 0 0 0 0.87 0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          opacity: 0.5,
          mixBlendMode: "screen",
        }}
      />

      {/* Converge animation — the signature loader from the design */}
      <ConvergeLoader size={120} id="splash-main" />
    </div>
  );
}
