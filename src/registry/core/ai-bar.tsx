"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function PreviewAiBar() {
  const [value, setValue] = React.useState("");
  return (
    <div className="flex h-[220px] flex-col justify-end rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 p-4">
      <motion.div
        layout
        className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Sparkles className="size-3 text-foreground/70" />
          Ask Nexus-UI to scaffold a hero…
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder="Describe the interface you want…"
        />
        <div className="mt-2 flex justify-end">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="rounded-full bg-foreground/90 px-3 py-1 text-xs font-semibold text-background"
          >
            Generate layout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
