"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function SceneOceanFlow() {
  return (
    <div
      className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl font-sans"
      style={{ background: "#050d1a" }}
    >
      {/* Ocean gradient wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(6,182,212,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Ripple rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10"
          animate={{ scale: [1, 2.6], opacity: [0.35, 0] }}
          transition={{ duration: 3.5, delay: i * 1.2, repeat: Infinity, ease: "easeOut" }}
          style={{ width: 120, height: 120 }}
        />
      ))}

      {/* Nav */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <div
            className="flex size-5 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)" }}
          >
            <svg viewBox="0 0 20 20" className="size-3 fill-white">
              <path d="M10 2C6 2 3 6 3 10s3 8 7 8 7-3.6 7-8-3-8-7-8zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 10c-2.5 0-4.7-1.3-6-3.3.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1C14.7 13.7 12.5 15 10 15z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-tight text-white">OceanFlow</span>
        </div>
        <div className="hidden items-center gap-4 text-[8px] sm:flex" style={{ color: "rgba(255,255,255,0.45)" }}>
          <span>Gear</span>
          <span>Technology</span>
          <span>Journal</span>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="rounded-full px-2.5 py-1 text-[8px] font-semibold text-white"
          style={{ background: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)" }}
        >
          Shop now
        </motion.div>
      </div>

      {/* Hero area */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-2 pt-2 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-2 font-mono text-[7px] uppercase tracking-[0.2em]"
          style={{ color: "rgba(34,211,238,0.7)" }}
        >
          Precision diving equipment
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold leading-[1.05] tracking-tight text-white"
          style={{ fontSize: "clamp(22px, 5vw, 32px)" }}
        >
          Dive deeper.{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #67e8f9 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Fear less.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-2 max-w-[240px] text-[8px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Equipment born from the world&apos;s most demanding dive sites.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 flex gap-2"
        >
          <div
            className="rounded-full px-3.5 py-1.5 text-[8px] font-semibold text-white"
            style={{
              background: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)",
              boxShadow: "0 0 16px rgba(6,182,212,0.25)",
            }}
          >
            Explore gear
          </div>
          <div
            className="flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-[8px] font-medium text-white/70"
            style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}
          >
            Watch film
            <svg className="size-2.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 4l6 4-6 4V4z" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Product card strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.7 }}
        className="relative z-10 flex gap-2 overflow-hidden px-5 pb-5"
      >
        {[
          { name: "AquaVision Pro", price: "$349", color: "#0e7490" },
          { name: "TidalForce Fins", price: "$229", color: "#1d4ed8" },
          { name: "DeepBreath Reg.", price: "$689", color: "#0369a1" },
        ].map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.08 }}
            className="flex flex-1 flex-col rounded-xl border p-2.5"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              background: `linear-gradient(135deg, ${item.color}22 0%, rgba(5,13,26,0.5) 100%)`,
            }}
          >
            <div
              className="mb-2 h-10 w-full rounded-lg"
              style={{ background: `${item.color}33` }}
            />
            <p className="text-[7px] font-semibold text-white/80">{item.name}</p>
            <p className="mt-0.5 text-[8px] font-bold" style={{ color: "#22d3ee" }}>
              {item.price}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
