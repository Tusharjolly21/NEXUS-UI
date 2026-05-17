"use client";

import * as React from "react";
import { BentoGridSkeleton, type SkeletonType } from "@/components/bento-grid-skeleton";
import { cn } from "@/lib/utils";

const CARDS = [
  { id: "1", title: "Ready-made sections", description: "Production-ready page blocks for any product.", tag: "Pages", span: "2x1" as const, skeletonType: "chat" as SkeletonType },
  { id: "2", title: "Interactive components", description: "Hooks, inputs, and controls that feel alive.", tag: "UI", span: "1x1" as const, skeletonType: "dashboard" as SkeletonType },
  { id: "3", title: "Copy-paste blocks", description: "Ship faster with drop-in component snippets.", tag: "DX", span: "1x1" as const, skeletonType: "avatar" as SkeletonType },
  { id: "4", title: "Premium animations", description: "Framer Motion layouts with a refined feel.", tag: "Motion", span: "1x1" as const, skeletonType: "workflow" as SkeletonType },
  { id: "5", title: "Responsive design", description: "Blocks that adapt cleanly to every viewport.", tag: "Mobile", span: "1x1" as const, skeletonType: "calendar" as SkeletonType },
  { id: "6", title: "Clean structure", description: "Typed, tree-shakeable, and easy to extend.", tag: "Dev", span: "1x1" as const, skeletonType: "code" as SkeletonType },
];

const LAYOUTS = [
  { id: "full", label: "6-Card Grid", cols: 3 },
  { id: "compact", label: "4-Card Compact", cols: 2 },
];

export function BentoGridSkeletonHeroCustomizer() {
  const [layout, setLayout] = React.useState("full");
  const cards = layout === "compact" ? CARDS.slice(0, 4) : CARDS;

  return (
    <div className="flex h-full flex-col gap-6 p-6 lg:flex-row">
      {/* Preview */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
        <div className="lf-grid absolute inset-0 opacity-30" />
        <div className="relative flex h-full flex-col justify-center p-5">
          <BentoGridSkeleton
            cards={cards}
            className="mx-auto w-full max-w-2xl"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/80 p-4 lg:w-52">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Layout</p>
          <div className="flex flex-col gap-2">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLayout(l.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-xs font-medium transition",
                  layout === l.id
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/5 bg-white/5 text-white/50 hover:border-white/10 hover:bg-white/8 hover:text-white/70",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5" />

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Cards</p>
          <div className="space-y-1.5">
            {CARDS.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-white/20" />
                <span className="text-[10px] text-white/40">{c.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}