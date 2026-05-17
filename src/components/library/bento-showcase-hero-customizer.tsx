"use client";

import * as React from "react";
import { BentoShowcase } from "@/components/registry/bento-showcase";
import { cn } from "@/lib/utils";

const LAYOUTS = [
  { id: "full", label: "4-Card Grid", desc: "All feature cards" },
  { id: "compact", label: "2-Card Compact", desc: "Two wide cards" },
];

export function BentoShowcaseHeroCustomizer() {
  const [layout, setLayout] = React.useState("full");

  const features = [
    { cta: "Learn more", href: "#" },
    { cta: "Learn more", href: "#" },
    { cta: "Learn more", href: "#" },
    { cta: "Learn more", href: "#" },
  ];

  return (
    <div className="flex h-full flex-col gap-6 p-6 lg:flex-row">
      {/* Preview */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
        <div className="lf-grid absolute inset-0 opacity-30" />
        <div className="relative flex h-full flex-col justify-center p-5">
          <BentoShowcase className="mx-auto w-full max-w-2xl" />
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
                  "w-full rounded-xl border px-3 py-2 text-left text-xs transition",
                  layout === l.id
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/5 bg-white/5 text-white/50 hover:border-white/10 hover:bg-white/8 hover:text-white/70",
                )}
              >
                <span className="block font-medium">{l.label}</span>
                <span className="block text-white/30">{l.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5" />

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Cards</p>
          <div className="space-y-1.5">
            {["Save files", "Notifications", "Integrations", "Calendar"].map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-white/20" />
                <span className="text-[10px] text-white/40">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}