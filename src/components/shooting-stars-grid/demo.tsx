"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShootingStarsGrid } from "./shooting-stars-grid";

export function ShootingStarsGridDemo() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <ShootingStarsGrid className="min-h-[680px]">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-200">
            Shooting Stars Grid
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Build interfaces that feel alive
          </h1>
          <p className="mt-5 max-w-2xl text-balance text-sm leading-6 text-zinc-600 sm:text-base dark:text-zinc-300">
            A calm grid background with ambient stars and straight grid-line runners for premium hero sections.
          </p>
          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/components"
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-950/20 dark:bg-white dark:text-zinc-950"
            >
              Browse Components
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white/55 px-5 py-2.5 text-sm font-semibold text-zinc-950 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-white"
            >
              View Templates
            </Link>
          </div>
        </div>
      </ShootingStarsGrid>
    </div>
  );
}
