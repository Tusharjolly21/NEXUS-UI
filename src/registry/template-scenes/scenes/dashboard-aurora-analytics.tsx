"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LineChart } from "lucide-react";

export function SceneDashboardAnalytics() {
  return (
    <div className="grid h-full min-h-[420px] gap-3 rounded-3xl border border-white/10 bg-zinc-950 p-4 md:grid-cols-4">
      <aside className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 md:block">
        {["Overview", "Signals", "Billing"].map((t) => (
          <div key={t} className="mb-2 rounded-xl px-3 py-2 text-xs text-zinc-300">
            {t}
          </div>
        ))}
      </aside>
      <div className="md:col-span-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Realtime activation</p>
          <LineChart className="size-4 text-cyan-300" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["WAU", "Latency", "Errors"].map((k, i) => (
            <motion.div
              key={k}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs text-zinc-400">{k}</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {i === 0 ? "38.4k" : i === 1 ? "41ms" : "0.02%"}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="h-40 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10" />
      </div>
    </div>
  );
}
