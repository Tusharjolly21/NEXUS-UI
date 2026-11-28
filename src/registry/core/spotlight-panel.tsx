"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { useMotionValue, useMotionTemplate, motion } from "framer-motion";
import * as React from "react";

export function PreviewSpotlightPanel() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }
  const bg = useMotionTemplate`radial-gradient(240px circle at ${x}px ${y}px, rgba(244,114,182,0.35), transparent 60%)`;

  return (
    <div
      onMouseMove={onMove}
      className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6"
    >
      <motion.div
        style={{ backgroundImage: bg }}
        className="absolute inset-0"
      />
      <div className="relative space-y-2">
        <p className="text-xs text-zinc-400">Motion spotlight</p>
        <p className="text-xl font-semibold text-white">
          Trace the cursor glow
        </p>
        <p className="text-sm text-zinc-400">
          Subtle, performant gradients that follow interaction.
        </p>
      </div>
    </div>
  );
}
