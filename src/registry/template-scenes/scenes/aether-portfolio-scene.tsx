"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function SceneAetherPortfolio() {
  return (
    <div
      className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl font-sans"
      style={{ background: "#09090c" }}
    >
      {/* Warm gold glow top-center */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 60% 0%, rgba(197,165,123,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3.5">
        <span className="text-[10px] font-bold tracking-tight text-white">Jordan Vale</span>
        <div className="hidden items-center gap-4 text-[8px] sm:flex" style={{ color: "rgba(255,255,255,0.4)" }}>
          <span>Work</span>
          <span>About</span>
          <span>Contact</span>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[7.5px] font-semibold"
          style={{ background: "rgba(197,165,123,0.12)", border: "1px solid rgba(197,165,123,0.3)", color: "#c5a57b" }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ background: "#c5a57b", boxShadow: "0 0 4px #c5a57b" }}
          />
          Available
        </motion.div>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-1 gap-4 px-5 pb-4 pt-3">
        {/* Left — text */}
        <div className="flex flex-1 flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-2 text-[7px] uppercase tracking-[0.18em]"
            style={{ color: "rgba(197,165,123,0.75)" }}
          >
            Product Designer & Developer
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-semibold leading-[1.12] text-white"
            style={{ fontSize: "clamp(16px, 3.8vw, 24px)" }}
          >
            Crafting digital{" "}
            <span style={{ color: "#c5a57b" }}>experiences</span>{" "}
            that matter
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-[7.5px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            5+ years crafting interfaces for ambitious teams worldwide.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-3 flex gap-2"
          >
            <div
              className="rounded-full px-3 py-1 text-[7px] font-semibold text-black"
              style={{ background: "#c5a57b" }}
            >
              View work
            </div>
            <div
              className="rounded-full border px-3 py-1 text-[7px] font-medium"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
            >
              Contact me
            </div>
          </motion.div>

          {/* Mini stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 flex gap-4"
          >
            {[["48+", "Projects"], ["5yr", "Experience"], ["32+", "Clients"]].map(([num, label]) => (
              <div key={label} className="flex flex-col">
                <span className="text-[10px] font-bold text-white">{num}</span>
                <span className="text-[6px]" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative hidden w-[100px] overflow-hidden rounded-2xl sm:block"
          style={{
            border: "1px solid rgba(197,165,123,0.15)",
            background: "rgba(197,165,123,0.05)",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"
            alt="Jordan Vale"
            className="h-full w-full object-cover"
            style={{ clipPath: "inset(0 0 0 0)" }}
          />
          {/* Gold overlay fade at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: "40%", background: "linear-gradient(to top, rgba(9,9,12,0.7) 0%, transparent 100%)" }}
          />
        </motion.div>
      </div>

      {/* Bottom logo strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 flex items-center gap-3 overflow-hidden border-t px-5 py-3"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <span className="text-[6.5px] shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
          Trusted by
        </span>
        {["Figma", "Stripe", "Linear", "Vercel", "Notion"].map((name) => (
          <span
            key={name}
            className="shrink-0 text-[7px] font-medium"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            {name}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
