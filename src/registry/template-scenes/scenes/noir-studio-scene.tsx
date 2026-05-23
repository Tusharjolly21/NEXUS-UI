"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function SceneNoirStudio() {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-black text-white">
      <div className="absolute inset-x-0 top-0 z-20 grid grid-cols-[1fr_auto] items-start gap-5 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-tight">
          NOIR <sup className="text-[8px]">®</sup>
        </p>
        <div className="flex gap-2">
          <span className="size-2 rounded-full bg-white" />
          <span className="size-2 rounded-full bg-white/60" />
          <span className="size-2 rounded-full bg-white/30" />
        </div>
      </div>
      <motion.div
        className="absolute left-1/2 top-[43%] size-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_38%_35%,#f5f5f5_0,#9b9b9b_34%,#333_62%,#060606_78%)] shadow-[0_0_70px_rgba(255,255,255,0.28)]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute inset-x-0 bottom-4 text-center font-black uppercase leading-[0.7] tracking-[-0.08em] text-white">
        <p className="scale-x-[0.52] text-[118px]">NOIR</p>
        <p className="scale-x-[0.52] text-[118px]">STUDIO</p>
      </div>
      <div className="absolute inset-x-6 bottom-6 z-20 flex justify-between text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
        <span>Selected work</span>
        <span>Scroll story</span>
      </div>
    </div>
  );
}
