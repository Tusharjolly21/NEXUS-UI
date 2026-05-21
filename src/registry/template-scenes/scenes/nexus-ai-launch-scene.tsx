"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function SceneNexusAiLaunch() {
  return (
    <div className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_0%,rgba(139,92,246,0.32),transparent_35%),radial-gradient(circle_at_12%_64%,rgba(14,165,233,0.20),transparent_30%),radial-gradient(circle,rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:auto,auto,22px_22px]" />
      <div className="absolute right-[-10%] top-[20%] h-[58%] w-[62%] rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl backdrop-blur">
        <div className="absolute inset-3 overflow-hidden rounded-[1.45rem] bg-black">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.45),rgba(14,165,233,0.22),rgba(236,72,153,0.30))]" />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/55 p-3 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] uppercase tracking-[0.22em] text-violet-200/80">Readiness</p>
                <p className="mt-1 text-[18px] font-semibold leading-none">94%</p>
              </div>
              <span className="rounded-full bg-emerald-300 px-2 py-1 text-[7px] font-bold text-emerald-950">
                +28%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="grid size-5 place-items-center rounded-lg border border-white/15 bg-white/8">
            <span className="size-2 rounded-full bg-violet-300" />
          </div>
          <span className="text-[10px] font-semibold">Asteria AI</span>
        </div>
        <div className="hidden items-center gap-4 text-[8px] text-white/45 sm:flex">
          <span>Features</span>
          <span>Workflow</span>
          <span>FAQ</span>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-[8px] font-semibold text-zinc-950">
          Start
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-8">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 text-[7px] font-semibold uppercase tracking-[0.24em] text-violet-200"
        >
          AI launch system
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="max-w-[260px] text-[28px] font-bold leading-[0.95] tracking-[-0.045em]"
        >
          Turn a messy idea into a page that converts.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-[230px] text-[8px] leading-relaxed text-white/50"
        >
          Hero, brand proof, bento features, workflow, testimonials, FAQ, and CTA.
        </motion.p>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2 px-5 pb-5">
        {["12 min", "48 blocks", "94% ready"].map((value) => (
          <div key={value} className="rounded-xl border border-white/10 bg-white/[0.055] p-2">
            <p className="text-[11px] font-semibold">{value}</p>
            <p className="mt-1 text-[6px] uppercase tracking-[0.16em] text-white/35">proof</p>
          </div>
        ))}
      </div>
    </div>
  );
}
