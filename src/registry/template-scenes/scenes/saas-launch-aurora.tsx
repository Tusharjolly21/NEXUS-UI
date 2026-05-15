"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function SceneSaaSLaunch() {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <div className="lf-aurora absolute inset-0 opacity-70" />
      <div className="lf-grid absolute inset-0 opacity-30" />
      <div className="relative flex h-full flex-col justify-between p-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
            <span className="text-sm font-semibold text-white">NebulaOps</span>
          </div>
          <div className="hidden gap-4 text-xs text-zinc-300 md:flex">
            <span>Product</span>
            <span>Docs</span>
            <span>Pricing</span>
          </div>
        </header>
        <div className="max-w-xl space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">SaaS launch</p>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Instrument every customer journey in real time.
          </h2>
          <p className="text-sm text-zinc-400">
            Opinionated analytics primitives, motion-rich dashboards, and a deploy story that
            feels like Vercel-grade polish.
          </p>
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950"
            >
              Start free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white backdrop-blur-xl"
            >
              View components
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
