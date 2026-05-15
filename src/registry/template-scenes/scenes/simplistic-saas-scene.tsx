"use client";

import * as React from "react";

export function SceneSimplisticSaaS() {
  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-6 flex flex-col justify-between font-sans">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 -z-10 h-64 w-64 bg-blue-500/10 blur-3xl rounded-full" />
      
      {/* Mini Header */}
      <header className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-1.5">
          <div className="size-5 rounded-md bg-zinc-950 text-white flex items-center justify-center text-[9px] font-bold dark:bg-white dark:text-zinc-950">
            𝝠
          </div>
          <span className="text-xs font-bold text-zinc-950 dark:text-white">Simplistic</span>
        </div>
        <div className="flex gap-2 text-[10px] text-zinc-400 font-medium">
          <span>Product</span>
          <span>Pricing</span>
        </div>
      </header>

      {/* Mini Hero Content */}
      <div className="my-auto space-y-3 py-4 text-center">
        <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          Autonomous Workflows →
        </span>
        <h3 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight max-w-xs mx-auto">
          Deploy AI agents that work while you sleep.
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 max-w-xs mx-auto">
          Build, deploy, and orchestrate intelligent AI agents autonomously.
        </p>

        {/* Mockup Window Header bar */}
        <div className="mt-4 mx-auto max-w-sm rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-5 items-center gap-1 bg-white px-2 border-b border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800">
            <span className="size-1.5 rounded-full bg-red-400" />
            <span className="size-1.5 rounded-full bg-amber-400" />
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="ml-auto text-[8px] font-mono text-zinc-400">app.simplistic.ai</span>
          </div>
          <div className="p-2 text-left space-y-1 bg-white dark:bg-zinc-950">
            <div className="flex justify-between items-center text-[9px]">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">⚡ Core Engine Loop</span>
              <span className="text-[8px] text-blue-500 font-medium bg-blue-50 dark:bg-blue-950 px-1 rounded">Active</span>
            </div>
            <div className="h-1.5 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-1.5 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Mini Footer Strip */}
      <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-900 text-[9px] text-zinc-400">
        <span>Trusted by 18+ Enterprise AI Brands</span>
        <span className="font-semibold text-blue-500">Live Engine Active</span>
      </div>
    </div>
  );
}
