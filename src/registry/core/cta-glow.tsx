"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { motion } from "framer-motion";

export function PreviewCtaGlow() {
  return (
    <div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <motion.div
        className="absolute size-40 rounded-full bg-foreground/8 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute size-40 rounded-full bg-foreground/6 blur-3xl"
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="lf-glow relative rounded-full bg-white px-6 py-2 text-sm font-semibold text-zinc-950"
      >
        Start building faster
      </motion.button>
    </div>
  );
}
