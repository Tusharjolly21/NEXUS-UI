"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { motion } from "framer-motion";

export function PreviewNavbarFloating() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="lf-grid absolute inset-0 opacity-40" />
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto mt-10 flex max-w-xl items-center justify-between gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700" />
          <span className="text-sm font-semibold text-white">Nexus-UI</span>
        </div>
        <div className="hidden items-center gap-4 text-xs text-zinc-300 sm:flex">
          <span>Library</span>
          <span>Templates</span>
          <span>Pricing</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900"
        >
          Get access
        </motion.button>
      </motion.div>
      <p className="absolute bottom-6 left-6 text-xs text-zinc-500">
        Floating glass navigation with spring entrance.
      </p>
    </div>
  );
}
