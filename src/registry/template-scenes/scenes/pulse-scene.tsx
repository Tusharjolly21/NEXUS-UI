"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function ScenePulse() {
  return (
    <div
      className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl font-sans"
      style={{ background: "#09090B" }}
    >
      {/* Subtle indigo glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 20 20" className="size-4 fill-white">
            <path d="M11 3H9v6H3v2h6v6h2v-6h6V9h-6z" />
          </svg>
          <span className="text-[10px] font-bold tracking-tight text-white">Pulse</span>
        </div>
        <div className="hidden items-center gap-4 text-[8px] sm:flex" style={{ color: "rgba(255,255,255,0.4)" }}>
          <span>Platform</span>
          <span>Docs</span>
          <span>Pricing</span>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="rounded-md px-2.5 py-1 text-[8px] font-semibold text-zinc-900"
          style={{ background: "#ffffff" }}
        >
          Start free
        </motion.div>
      </div>

      {/* Hero text */}
      <div className="relative z-10 flex flex-col items-start justify-center px-5 pb-2 pt-3">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-1.5 text-[7px] uppercase tracking-[0.18em]"
          style={{ color: "rgba(99,102,241,0.8)" }}
        >
          Engineering operations
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[200px] font-semibold leading-[1.1] text-white"
          style={{ fontSize: "clamp(14px, 3.5vw, 20px)" }}
        >
          The OS for high-velocity teams
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 flex gap-2"
        >
          <div
            className="rounded-md px-3 py-1 text-[7px] font-semibold text-zinc-900"
            style={{ background: "#ffffff" }}
          >
            Start free
          </div>
          <div
            className="flex items-center rounded-md border px-3 py-1 text-[7px] font-medium"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.04)" }}
          >
            New: Pulse AI for GitHub →
          </div>
        </motion.div>
      </div>

      {/* 3D dashboard mockup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.8 }}
        className="relative z-10 mx-4 mt-3 flex-1 overflow-hidden rounded-xl border"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "#111114",
          transform: "perspective(600px) rotateX(8deg)",
          transformOrigin: "top center",
        }}
      >
        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10"
          style={{ height: "50%", background: "linear-gradient(to top, #09090B 10%, transparent 100%)" }}
        />
        {/* Sidebar */}
        <div className="flex h-full">
          <div
            className="flex w-[52px] flex-col gap-1 border-r px-1.5 py-2"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
          >
            {["Inbox", "Issues", "Roadmap", "Teams"].map((label, i) => (
              <div
                key={label}
                className="flex h-4 items-center rounded px-1 text-[5px]"
                style={{
                  color: i === 0 ? "#fff" : "rgba(255,255,255,0.3)",
                  background: i === 0 ? "rgba(255,255,255,0.08)" : "transparent",
                }}
              >
                {label}
              </div>
            ))}
          </div>
          {/* Main panel */}
          <div className="flex-1 p-2">
            <p className="mb-1.5 text-[6px] font-medium text-white">Inbox</p>
            {[
              { id: "PLS-241", title: "Migrate auth tokens to JWTs", status: "in-progress" },
              { id: "PLS-302", title: "Webhook delivery silently failing", status: "bug" },
              { id: "PLS-309", title: "Rate limiter not resetting on retry", status: "bug" },
              { id: "DES-112", title: "Refresh notification center UI", status: "todo" },
            ].map((item) => (
              <div
                key={item.id}
                className="mb-1 flex items-center gap-1.5 rounded px-1.5 py-1"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <span
                  className="size-1.5 rounded-full flex-shrink-0"
                  style={{
                    background:
                      item.status === "in-progress"
                        ? "#eab308"
                        : item.status === "bug"
                        ? "#ef4444"
                        : "#52525b",
                  }}
                />
                <span className="text-[5.5px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {item.id}
                </span>
                <span className="truncate text-[5.5px] text-white">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
