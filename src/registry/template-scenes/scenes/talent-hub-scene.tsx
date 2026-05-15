"use client";

import * as React from "react";
import { motion } from "framer-motion";

const BRAND = "#13139C";
const LAV = "#BBC2FB";
const LAV_SOFT = "#E8EAFF";

export function SceneTalentHub() {
  return (
    <div className="relative flex h-full min-h-105 flex-col overflow-hidden rounded-3xl bg-white font-sans">
      {/* Soft lavender radial top */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(60% 40% at 50% 0%, ${LAV_SOFT} 0%, transparent 70%)` }}
      />

      {/* Navbar */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#E4E5F5] px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🦄</span>
          <span className="text-[11px] font-extrabold tracking-tight" style={{ color: BRAND }}>TalentHub</span>
        </div>
        <div className="hidden gap-3 text-[8px] font-medium text-zinc-400 sm:flex">
          <span>Unicorns</span><span>Process</span><span>Pricing</span>
        </div>
        <div className="rounded-full px-2.5 py-1 text-[8px] font-bold text-white" style={{ background: BRAND }}>
          Start Hiring
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-3 pt-4 text-center">
        {/* Badge */}
        <div
          className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[7px] font-bold uppercase tracking-widest"
          style={{ background: LAV_SOFT, color: BRAND }}
        >
          <span className="size-1 animate-pulse rounded-full" style={{ background: BRAND }} />
          Unicorn Talent at 70% Less
        </div>

        {/* Headline */}
        <h1 className="max-w-[200px] text-balance text-xl font-extrabold leading-[1.05] tracking-tight sm:text-2xl" style={{ color: "#0B0B1A" }}>
          Scale Faster{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${BRAND} 0%, #5B5BF5 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            with Unicorn
          </span>{" "}
          Talent 🦄
        </h1>

        <p className="mx-auto mt-2 max-w-[180px] text-[8px] leading-relaxed text-zinc-400">
          World-class talent from PH & LATAM at 60–70% less than local hires.
        </p>

        {/* CTAs */}
        <div className="mt-4 flex items-center gap-2">
          <div className="rounded-full px-3 py-1.5 text-[8px] font-bold text-white" style={{ background: BRAND }}>
            Start Hiring →
          </div>
          <div className="rounded-full border border-[#E4E5F5] px-3 py-1.5 text-[8px] font-semibold text-zinc-600">
            Become a Unicorn
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-5 flex w-full max-w-[260px] items-center justify-around rounded-2xl border border-[#E4E5F5] bg-[#F7F7FF] px-3 py-2.5">
          {[["1,000+", "Businesses"], ["70%", "Cost Saved"], ["14 days", "Avg Hire"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-[10px] font-extrabold" style={{ color: BRAND }}>{v}</p>
              <p className="text-[6px] text-zinc-400">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Department bento mini preview */}
      <div className="relative z-10 border-t border-[#E4E5F5] bg-[#F7F7FF] px-4 py-3">
        <p className="mb-2 text-[7px] font-bold uppercase tracking-widest" style={{ color: BRAND }}>Departments</p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { e: "🗂️", t: "Admin", c: "#EEF0FF" },
            { e: "⚙️", t: "Operations", c: "#FFF7EE" },
            { e: "📣", t: "Marketing", c: "#F0FFF4" },
            { e: "💬", t: "Support", c: "#FFF0F6" },
            { e: "🎯", t: "Niche", c: "#F5F0FF" },
            { e: "💵", t: "Finance", c: "#F0FFFA" },
          ].map(({ e, t, c }) => (
            <motion.div
              key={t}
              whileHover={{ scale: 1.04 }}
              className="rounded-lg px-2 py-1.5 text-center"
              style={{ background: c }}
            >
              <div className="text-sm">{e}</div>
              <div className="mt-0.5 text-[7px] font-bold text-zinc-700">{t}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
