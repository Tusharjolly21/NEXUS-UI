"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function SceneProductivitySuite() {
  return (
    <div className="flex h-full min-h-[420px] flex-col gap-4 rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Productivity</p>
          <h2 className="text-2xl font-semibold text-white">Calm density for power users.</h2>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-950">
          New project
        </motion.button>
      </div>
      <div className="grid flex-1 gap-3 md:grid-cols-3">
        {["Inbox", "Roadmap", "Automations"].map((c) => (
          <div key={c} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm font-semibold text-white">{c}</p>
            <div className="mt-4 space-y-2">
              <div className="h-2 rounded bg-white/10" />
              <div className="h-2 w-2/3 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
