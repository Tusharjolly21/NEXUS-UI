"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";

// ─── Dynamic Three.js import (SSR disabled) ────────────────────────────────────
const DottedSphere = dynamic(() => import("./yourbrand-dotted-sphere"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="size-64 rounded-full bg-indigo-500/5 blur-3xl" />
    </div>
  ),
});

// ─── Background glow blobs ─────────────────────────────────────────────────────
function BackgroundGlow() {
  const reduce = useReducedMotion() === true;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Blob 1 — top-left purple */}
      <motion.div
        className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18)_0%,transparent_70%)] blur-3xl"
        animate={
          reduce
            ? undefined
            : {
                x: [0, 80, -40, 0],
                y: [0, -60, 40, 0],
              }
        }
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Blob 2 — right purple/blue */}
      <motion.div
        className="absolute -right-60 top-10 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.14)_0%,transparent_65%)] blur-3xl"
        animate={
          reduce
            ? undefined
            : {
                x: [0, -60, 30, 0],
                y: [0, 80, -50, 0],
              }
        }
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      {/* Blob 3 — bottom center */}
      <motion.div
        className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.10)_0%,transparent_60%)] blur-3xl"
        animate={
          reduce
            ? undefined
            : {
                scaleX: [1, 1.2, 0.9, 1],
                scaleY: [1, 0.8, 1.15, 1],
              }
        }
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 8 }}
      />
    </div>
  );
}

// ─── Pulsing dot ───────────────────────────────────────────────────────────────
function PulsingDot({ color = "bg-indigo-400" }: { color?: string }) {
  return (
    <span className="relative flex size-2 shrink-0">
      <motion.span
        className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}
        animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className={`relative inline-flex size-2 rounded-full ${color}`} />
    </span>
  );
}

// ─── SVG wavy lines ────────────────────────────────────────────────────────────
function WavyLines() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 right-0 w-full opacity-[0.06]"
      viewBox="0 0 1440 120"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 60 C240 20, 480 100, 720 60 C960 20, 1200 100, 1440 60"
        stroke="url(#waveGrad1)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M0 80 C240 40, 480 120, 720 80 C960 40, 1200 120, 1440 80"
        stroke="url(#waveGrad1)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M0 100 C360 60, 720 140, 1080 100 C1260 80, 1380 110, 1440 100"
        stroke="url(#waveGrad1)"
        strokeWidth="0.75"
        fill="none"
      />
      <defs>
        <linearGradient id="waveGrad1" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
          <stop offset="30%" stopColor="#8b5cf6" stopOpacity="1" />
          <stop offset="70%" stopColor="#6366f1" stopOpacity="1" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const reduce = useReducedMotion() === true;
  const links = ["ABOUT", "SERVICES", "HOW IT WORKS", "BLOG"];

  return (
    <motion.nav
      initial={reduce ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex items-center justify-between px-6 py-5 md:px-10 lg:px-16"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg shadow-indigo-500/30" />
        <span className="text-sm font-bold tracking-[0.15em] text-white">
          YOURBRAND
        </span>
      </div>

      {/* Nav links */}
      <ul className="hidden items-center gap-8 md:flex">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-[11px] font-medium tracking-[0.14em] text-zinc-400 transition-colors duration-200 hover:text-white"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA pill */}
      <motion.button
        whileHover={reduce ? undefined : { scale: 1.04 }}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-white backdrop-blur-sm transition-shadow hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] md:flex"
      >
        <PulsingDot color="bg-indigo-400" />
        CONTACT US
      </motion.button>
    </motion.nav>
  );
}

// ─── Hero section ──────────────────────────────────────────────────────────────
export default function YourBrandHeroPage() {
  const reduce = useReducedMotion() === true;

  return (
    <div
      className="relative min-h-dvh overflow-hidden font-sans"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      <BackgroundGlow />

      {/* Subtle dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <WavyLines />

      {/* Navbar */}
      <Navbar />

      {/* Hero body */}
      <div className="relative z-10 flex min-h-[calc(100dvh-80px)] flex-col items-center lg:flex-row">
        {/* ── Left column ──────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-center px-6 py-16 md:px-10 lg:w-[60%] lg:px-16 lg:py-0">
          {/* Badge pill */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="mb-8 inline-flex w-fit items-center gap-2.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2"
          >
            <PulsingDot color="bg-indigo-400" />
            <span className="text-xs font-medium tracking-[0.1em] text-indigo-300">
              Your Tagline Here
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            Your
            <br />
            Headline.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Goes Here.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
            className="mt-7 max-w-md text-base leading-relaxed text-zinc-400"
          >
            Replace this with your value proposition. Explain what you do, who
            you serve, and why it matters — in two or three sentences that earn
            a click.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.38 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <motion.button
              whileHover={
                reduce
                  ? undefined
                  : {
                      scale: 1.04,
                      boxShadow: "0 0 32px rgba(99,102,241,0.45)",
                    }
              }
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="rounded-full border border-indigo-500/50 bg-indigo-600/20 px-8 py-3.5 text-sm font-semibold tracking-[0.1em] text-white backdrop-blur-sm transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-600/30"
            >
              BOOK A CALL
            </motion.button>

            <motion.button
              whileHover={reduce ? undefined : { scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="rounded-full px-6 py-3.5 text-sm font-medium tracking-[0.1em] text-zinc-400 transition-colors hover:text-white"
            >
              LEARN MORE →
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-12 flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"].map((bg, i) => (
                <div
                  key={i}
                  className="size-8 rounded-full border-2 border-[#0a0a0f]"
                  style={{ backgroundColor: bg }}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              <span className="font-semibold text-zinc-300">200+</span> clients
              worldwide
            </p>
          </motion.div>
        </div>

        {/* ── Right column — Three.js sphere ───────────────────────────────── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative hidden h-full w-full flex-shrink-0 items-center justify-center lg:flex lg:w-[40%]"
          style={{ minHeight: "calc(100dvh - 80px)" }}
        >
          <DottedSphere />
        </motion.div>
      </div>
    </div>
  );
}
