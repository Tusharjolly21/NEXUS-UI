"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function SceneAgencyStudio() {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <motion.div
        className="absolute inset-x-10 top-10 h-40 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl"
        initial={{ rotate: -1.5, y: 10, opacity: 0 }}
        animate={{ rotate: -1, y: 0, opacity: 1 }}
      />
      <motion.div
        className="absolute inset-x-16 top-24 h-40 rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/15 to-fuchsia-500/10 backdrop-blur-xl"
        initial={{ rotate: 1.5, y: 18, opacity: 0 }}
        animate={{ rotate: 1, y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
      />
      <div className="relative flex h-full flex-col justify-end p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Agency</p>
        <h2 className="mt-2 max-w-xl text-3xl font-semibold text-white">
          Pitch decks meet product craft — a studio-grade hero stack.
        </h2>
      </div>
    </div>
  );
}
