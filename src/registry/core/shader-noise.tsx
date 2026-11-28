"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { motion } from "framer-motion";

export function PreviewShaderNoise() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        }}
        animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative flex h-full items-center justify-center text-center text-sm text-zinc-200">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-foreground/55">
            Shaders
          </p>
          <p className="mt-2 font-semibold">SVG turbulence noise field</p>
        </div>
      </div>
    </div>
  );
}
