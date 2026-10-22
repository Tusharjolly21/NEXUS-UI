"use client";

import type { CSSProperties } from "react";
import { clamp, ease } from "./kit";

/**
 * Digits that roll up a strip into place like a mechanical odometer, left to right. `q` is 0..1
 * progress; non-digits ("$", ",", ".") stay put. `size` is the font size in pixels.
 */
export function Odometer({ text, q, size, style }: { text: string; q: number; size: number; style?: CSSProperties }) {
  const chars = [...text];
  const digitAt = chars.map((c, i) => (/\d/.test(c) ? i : -1)).filter((i) => i >= 0);
  const mask = "linear-gradient(transparent, #000 16%, #000 84%, transparent)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontVariantNumeric: "tabular-nums", lineHeight: 1, ...style }}>
      {chars.map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i}>{ch}</span>;
        const k = digitAt.indexOf(i);
        const delay = (k / Math.max(1, digitAt.length)) * 0.3;
        const eased = ease.quint(clamp((q - delay) / 0.7));
        const turns = +ch + 10 * (1 + k);
        return (
          <span
            key={i}
            style={{ position: "relative", display: "inline-block", height: size * 1.2, margin: `${-size * 0.1}px 0`, overflow: "hidden", WebkitMaskImage: mask, maskImage: mask }}
          >
            <span style={{ visibility: "hidden", lineHeight: 1.2 }}>0</span>
            <span style={{ position: "absolute", left: 0, top: 0, lineHeight: 1.2, transform: `translateY(${-turns * eased * size * 1.2}px)` }}>
              {Array.from({ length: turns + 1 }, (_, n) => (
                <span key={n} style={{ display: "block", height: size * 1.2 }}>
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** A mouse pointer drawn in SVG. `press` (0..1) shrinks it a little, as a click does. */
export function Cursor({ x, y, size = 44, press = 0, color = "#1d1d1f", opacity = 1 }: { x: number; y: number; size?: number; press?: number; color?: string; opacity?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        left: x - size * 0.14,
        top: y - size * 0.08,
        transformOrigin: "14% 8%",
        transform: `scale(${1 - press * 0.14})`,
        opacity,
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,.3))",
        zIndex: 20,
      }}
    >
      <path d="M4 2l15 9.5-6.6 1.4 3.6 7-2.6 1.3-3.6-7L4 18.5z" fill={color} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** A whole number with thousands separators, e.g. 48210 becomes "48,210". */
export const num = (n: number, locale = "en-US") => Math.round(n).toLocaleString(locale);
