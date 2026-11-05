"use client";

import { motion } from "framer-motion";
import { INK, MUTED } from "../theme";

/** Where the 42 sits on the half-circle gauge: 0.79 of a half turn from the left end. */
const NEEDLE_ANGLE = Math.PI * 0.79;

const READINGS: [string, string][] = [
  ["PM2.5", "8 µg/m³"],
  ["Ozone", "31 µg/m³"],
  ["Nitrogen dioxide", "12 µg/m³"],
  ["Pollen", "Low"],
];

/** "Air you can read": a half-circle gauge whose marker springs to the reading when the screen scrolls into view. */
export function AirQualityScreen() {
  return (
    <div className="flex h-full flex-col px-5 pt-14" style={{ background: "#fff", color: INK }}>
      <div className="text-[13px] font-medium" style={{ color: MUTED }}>
        Air quality
      </div>
      <div className="mt-1 text-[24px] font-semibold tracking-[-0.02em]">Good for a run</div>
      <svg viewBox="0 0 240 140" className="mx-auto mt-6 block w-[240px]" aria-label="Air quality index 42, good">
        <defs>
          <linearGradient id="nb-aqi" x1="0" x2="1">
            <stop offset="0" stopColor="#34c759" />
            <stop offset=".35" stopColor="#ffd60a" />
            <stop offset=".6" stopColor="#ff9f0a" />
            <stop offset=".8" stopColor="#ff3b30" />
            <stop offset="1" stopColor="#af52de" />
          </linearGradient>
        </defs>
        <path d="M20,124 A100,100 0 0 1 220,124" fill="none" stroke="url(#nb-aqi)" strokeWidth="14" strokeLinecap="round" />
        <motion.circle
          r="10"
          fill="#fff"
          stroke={INK}
          strokeWidth="3"
          initial={{ cx: 20, cy: 124 }}
          whileInView={{ cx: 120 + Math.cos(NEEDLE_ANGLE) * 100, cy: 124 - Math.sin(NEEDLE_ANGLE) * 100 }}
          viewport={{ once: false }}
          transition={{ type: "spring", stiffness: 60, damping: 12 }}
        />
        <text x="120" y="112" textAnchor="middle" fontSize="44" fontWeight="600" fill={INK}>
          42
        </text>
      </svg>
      <div className="mt-6 grid gap-2">
        {READINGS.map(([name, value]) => (
          <div key={name} className="flex justify-between border-t pt-2 text-[14px]" style={{ borderColor: "rgba(0,0,0,.07)" }}>
            <span style={{ color: MUTED }}>{name}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
