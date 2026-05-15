"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function SceneAIStartup() {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <motion.div
        className="absolute -right-24 -top-24 size-72 rounded-full bg-fuchsia-500/25 blur-3xl"
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <div className="relative grid h-full gap-6 p-8 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
            <Sparkles className="size-3 text-cyan-300" />
            AI copilot surface
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Ship an AI-native product story without generic gradients.
          </h2>
          <p className="text-sm text-zinc-400">
            Includes prompt rail, feature lattice, and testimonial depth stack tuned for AI
            tooling landing pages.
          </p>
        </div>
        <motion.div
          layout
          className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <label className="text-xs text-zinc-400">Ask Forge</label>
          <textarea
            readOnly
            className="mt-2 h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none"
            defaultValue="Generate a pricing section with annual toggle and compliance callouts…"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-zinc-950"
            >
              Run sequence
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
