"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { ShootingStarsGrid } from "@/components/shooting-stars-grid";

export function PreviewShootingStarsGridHero() {
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
