"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import * as React from "react";
import { motion } from "framer-motion";

export function PreviewPricingToggle() {
  const [annual, setAnnual] = React.useState(true);
  const price = annual ? 29 : 39;
  return (
    <div className="flex h-[220px] flex-col justify-between rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-400">
            Premium
          </p>
          <p className="text-lg font-semibold text-white">
            Everything unlocked
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAnnual((v) => !v)}
          className="relative h-8 w-16 rounded-full border border-white/10 bg-white/5"
        >
          <motion.span
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute top-1 left-1 h-6 w-6 rounded-full bg-foreground/20"
            animate={{ x: annual ? 0 : 32 }}
          />
        </button>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-semibold tracking-tight text-white">
            ${price}
          </p>
          <p className="text-xs text-zinc-400">per seat / month</p>
        </div>
        <motion.div
          key={annual ? "a" : "m"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/50 bg-muted/40 px-3 py-2 text-xs text-foreground/80"
        >
          {annual ? "Save 20% annually" : "Flexible monthly"}
        </motion.div>
      </div>
    </div>
  );
}
