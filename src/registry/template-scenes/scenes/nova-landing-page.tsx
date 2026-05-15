"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function SceneNovaLandingPage() {
  return (
    <div
      className="relative flex h-full min-h-105 flex-col overflow-hidden rounded-3xl font-sans"
      style={{ background: "oklch(98.5% 0.004 80)" }}
    >
      {/* Subtle warm gradient wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, oklch(92% 0.03 80 / 0.6) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-1.5">
          <div
            className="flex size-5 items-center justify-center rounded-full"
            style={{ background: "oklch(14% 0.012 255)" }}
          >
            <svg viewBox="0 0 10 10" className="size-2.5 fill-white">
              <polygon points="5,1 9,8 1,8" />
            </svg>
          </div>
          <span
            className="text-xs font-bold tracking-tight"
            style={{ color: "oklch(14% 0.012 255)" }}
          >
            Nova
          </span>
        </div>
        <div className="hidden items-center gap-3 text-[9px] sm:flex" style={{ color: "oklch(45% 0.012 255)" }}>
          <span>Product</span>
          <span>Specs</span>
          <span>Pricing</span>
        </div>
        <motion.div
          whileHover={{ scale: 1.04 }}
          className="rounded-full px-2.5 py-1 text-[9px] font-semibold text-white"
          style={{ background: "oklch(14% 0.012 255)" }}
        >
          Buy
        </motion.div>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-2 pt-3 text-center">
        <p
          className="mb-1.5 text-[8px] font-semibold uppercase tracking-widest"
          style={{ color: "oklch(58% 0.14 252)" }}
        >
          Introducing Nova One
        </p>
        <h1
          className="max-w-55 text-balance text-2xl font-bold leading-[1.1] tracking-tight sm:text-3xl"
          style={{ color: "oklch(14% 0.012 255)" }}
        >
          Built for what&apos;s next.
        </h1>
        <p
          className="mx-auto mt-2 max-w-45 text-[8px] leading-relaxed"
          style={{ color: "oklch(45% 0.012 255)" }}
        >
          The thinnest, fastest laptop we&apos;ve ever made — engineered for creators and developers alike.
        </p>

        {/* Laptop mockup */}
        <div className="mt-5 w-full max-w-60">
          {/* Screen */}
          <div
            className="relative mx-auto rounded-t-xl pb-[60%]"
            style={{ background: "oklch(18% 0.012 255)", border: "2px solid oklch(25% 0.012 255)" }}
          >
            <div className="absolute inset-2 overflow-hidden rounded-lg">
              <div
                className="h-full w-full"
                style={{
                  background: "linear-gradient(135deg, oklch(20% 0.025 255) 0%, oklch(12% 0.015 255) 100%)",
                }}
              />
              {/* Fake UI lines on screen */}
              <div className="absolute inset-3 space-y-1.5">
                <div className="h-1.5 w-2/3 rounded-full" style={{ background: "oklch(50% 0.12 252 / 0.7)" }} />
                <div className="h-1 w-1/2 rounded-full" style={{ background: "oklch(70% 0.05 255 / 0.3)" }} />
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <div className="rounded-md p-1.5" style={{ background: "oklch(25% 0.02 255)" }}>
                    <div className="h-1 w-full rounded-full" style={{ background: "oklch(60% 0.1 252 / 0.5)" }} />
                    <div className="mt-1 h-0.5 w-2/3 rounded-full" style={{ background: "oklch(50% 0.05 255 / 0.3)" }} />
                  </div>
                  <div className="rounded-md p-1.5" style={{ background: "oklch(25% 0.02 255)" }}>
                    <div className="h-1 w-full rounded-full" style={{ background: "oklch(60% 0.1 252 / 0.5)" }} />
                    <div className="mt-1 h-0.5 w-3/4 rounded-full" style={{ background: "oklch(50% 0.05 255 / 0.3)" }} />
                  </div>
                </div>
              </div>
              {/* Subtle ambient glow on screen */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse 60% 40% at 50% 30%, oklch(58% 0.14 252 / 0.12) 0%, transparent 70%)",
                }}
              />
            </div>
          </div>
          {/* Base */}
          <div
            className="mx-auto h-2 rounded-b-lg"
            style={{
              background: "oklch(22% 0.012 255)",
              width: "100%",
            }}
          />
          <div
            className="mx-auto mt-0.5 h-1 rounded-full"
            style={{
              background: "oklch(28% 0.012 255)",
              width: "40%",
            }}
          />
        </div>

        {/* CTA row */}
        <div className="mt-5 flex items-center gap-2">
          <div
            className="rounded-full px-3 py-1.5 text-[8px] font-semibold text-white"
            style={{ background: "oklch(58% 0.14 252)" }}
          >
            Order now
          </div>
          <div
            className="rounded-full border px-3 py-1.5 text-[8px] font-medium"
            style={{
              borderColor: "oklch(80% 0.015 255)",
              color: "oklch(35% 0.012 255)",
            }}
          >
            Learn more ›
          </div>
        </div>
      </div>

      {/* Spec strip */}
      <div
        className="relative z-10 border-t px-5 py-3"
        style={{ borderColor: "oklch(90% 0.01 255)", background: "oklch(97% 0.005 80)" }}
      >
        <div className="flex items-center justify-around">
          {[
            { stat: "12h", label: "Battery" },
            { stat: "4K", label: "Display" },
            { stat: "4nm", label: "Chip" },
          ].map(({ stat, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span
                className="text-xs font-bold"
                style={{ color: "oklch(14% 0.012 255)" }}
              >
                {stat}
              </span>
              <span className="text-[7px]" style={{ color: "oklch(55% 0.01 255)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
