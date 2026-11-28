"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { ShootingStarsGrid } from "@/components/shooting-stars-grid";
import { motion } from "framer-motion";

function PreviewShootingStarsGridHero() {
  return (
    <ShootingStarsGrid
      className="min-h-[560px] rounded-3xl"
      starCount={54}
      shootingStarCount={7}
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-200">
          Motion background
        </p>
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Build interfaces that feel alive
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          A subtle grid with ambient stars and straight light runners attached
          to the grid.
        </p>
      </div>
    </ShootingStarsGrid>
  );
}

export function PreviewShootingStarsGrid({
  compact = true,
}: { compact?: boolean } = {}) {
  return compact ? (
    <ShootingStarsGrid
      className="min-h-[380px] rounded-2xl"
      contentClassName="px-5 py-5"
      starCount={12}
      shootingStarCount={7}
      gridSize={34}
    >
      <div className="relative h-[260px] w-full max-w-[420px] overflow-hidden rounded-3xl border border-cyan-400/15 bg-white/35 shadow-2xl shadow-cyan-950/10 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/35">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.16)_1px,transparent_1px)] bg-[size:34px_34px] opacity-70 dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]" />
        <motion.div
          className="absolute left-[34px] top-[68px] h-px w-[280px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_rgba(6,182,212,0.65)]"
          animate={{ x: [-70, 62, -70], opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[204px] top-[34px] h-[204px] w-px bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_18px_rgba(103,232,249,0.65)]"
          animate={{ y: [54, -30, 54], opacity: [0.2, 0.9, 0.2] }}
          transition={{
            duration: 5.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.35,
          }}
        />
        {[0, 1, 2, 3].map((index) => (
          <motion.span
            key={index}
            className="absolute size-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]"
            style={{
              left: `${68 + index * 68}px`,
              top: `${68 + (index % 2) * 102}px`,
            }}
            animate={{ scale: [0.8, 1.45, 0.8], opacity: [0.45, 1, 0.45] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.35,
            }}
          />
        ))}
        <motion.div
          className="absolute bottom-[34px] left-[68px] grid grid-cols-4 gap-[17px]"
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="size-[17px] rounded-md border border-cyan-400/25 bg-cyan-400/10 shadow-[0_0_16px_rgba(6,182,212,0.18)]"
            />
          ))}
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,transparent_0%,transparent_32%,rgba(255,255,255,0.55)_78%)] dark:bg-[radial-gradient(circle_at_50%_46%,transparent_0%,transparent_34%,rgba(7,9,15,0.75)_78%)]" />
      </div>
    </ShootingStarsGrid>
  ) : (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4">
      <PreviewShootingStarsGridHero />
    </div>
  );
}
