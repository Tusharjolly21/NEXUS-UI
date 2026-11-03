"use client";

/**
 * Motion Kit previews (batch 21): Liquid Smoke. It stirs itself (autoplay) until a real pointer arrives. The full
 * preview has three looks to switch between; the compact one (gallery tiles) shows the first.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { LiquidSmoke, type SmokeSettings } from "@/components/liquid-smoke";

type Look = SmokeSettings & { name: string; bg: string; light?: boolean };

const LOOKS: Look[] = [
  { name: "Mercury", bg: "#0b0b0d", color: "#e8e8ee", swirl: 18, gloss: 0.9, fade: 2.2 },
  { name: "Ink wash", bg: "#f5f4f0", light: true, color: "#1d1d1f", blend: "multiply", fade: 1.3, swirl: 9, gloss: 0 },
  { name: "Prism", bg: "#0b0b0d", rainbow: true, swirl: 26, gloss: 0.35, fade: 2.6, radius: 0.3 },
];

export function PreviewLiquidSmoke({ compact = false }: { compact?: boolean } = {}) {
  const [i, setI] = useState(0);
  const { name, bg, light, ...look } = LOOKS[compact ? 0 : i];
  return (
    <motion.div
      className={`relative h-full w-full overflow-hidden ${compact ? "min-h-[360px]" : "min-h-[440px]"}`}
      animate={{ backgroundColor: bg }}
      initial={false}
      transition={{ duration: 0.5 }}
    >
      {!light && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
      )}
      {/* keyed on the look, so switching starts a clean fluid instead of mixing silver into ink */}
      <LiquidSmoke key={name} {...look} autoplay />
      {!compact && (
        <div
          role="radiogroup"
          aria-label="Look"
          className="absolute right-3 top-3 flex rounded-full p-[3px] backdrop-blur-md"
          style={{ background: light ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.1)" }}
        >
          {LOOKS.map((l, k) => (
            <button
              key={l.name}
              type="button"
              role="radio"
              aria-checked={i === k}
              onClick={() => setI(k)}
              className="relative h-7 rounded-full px-3 text-[12.5px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
              style={{ color: i === k ? "#1d1d1f" : light ? "#6e6e73" : "rgba(255,255,255,.75)" }}
            >
              {i === k && (
                <motion.span
                  layoutId="liquid-smoke-look"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.12),0_3px_8px_-3px_rgba(0,0,0,.15)]"
                  transition={{ type: "spring", stiffness: 450, damping: 34 }}
                />
              )}
              <span className="relative">{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
