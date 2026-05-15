"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";

export function ScenePortfolioDev() {
  return (
    <div className="grid h-full min-h-[420px] gap-4 rounded-3xl border border-white/10 bg-zinc-950 p-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Developer portfolio</p>
        <h2 className="text-3xl font-semibold text-white">Tushar builds interfaces that feel alive.</h2>
        <p className="text-sm text-zinc-400">
          Case-study ready layout with scroll choreography, code-forward typography, and crisp
          motion accents.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {["Systems", "WebGL", "Design"].map((t) => (
            <motion.div
              key={t}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-sm font-semibold text-white">{t}</p>
              <p className="mt-2 text-xs text-zinc-500">Selected work</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-4">
        <Cpu className="size-5 text-cyan-300" />
        <p className="mt-4 text-sm text-white">Stack</p>
        <p className="mt-2 text-xs text-zinc-400">Next.js · Tailwind · Motion · Supabase</p>
      </div>
    </div>
  );
}
