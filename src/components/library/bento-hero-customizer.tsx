"use client";

import * as React from "react";
import { AnimatedBentoGrid, type BentoVariant } from "@/components/animated-bento-grid";
import { cn } from "@/lib/utils";

const VARIANTS: { id: BentoVariant; label: string; desc: string }[] = [
  { id: "default", label: "Default", desc: "Subtle gradient fill" },
  { id: "glass", label: "Glass", desc: "Glassmorphism layer" },
  { id: "gradient-border", label: "Gradient Border", desc: "Edge glow on hover" },
  { id: "spotlight", label: "Spotlight", desc: "Radial glow anchor" },
];

const PRESETS = [
  {
    name: "KPI Metrics",
    accent: "#38bdf8",
    columns: 3 as const,
    items: [
      { id: "1", label: "Latency", value: "42ms", span: "1x1" as const },
      { id: "2", label: "Uptime", value: "99.99%", span: "2x1" as const, trend: { value: 0.1, label: "vs last month" } },
      { id: "3", label: "Signals", value: "1.2M", span: "1x1" as const },
      { id: "4", label: "Edge Regions", value: "12", span: "1x1" as const, trend: { value: 20, label: "new this quarter" } },
    ],
  },
  {
    name: "SaaS Dashboard",
    accent: "#a78bfa",
    columns: 3 as const,
    items: [
      { id: "1", label: "MRR", value: "$84.2K", span: "1x1" as const, trend: { value: 12.4, label: "MoM" } },
      { id: "2", label: "Active Users", value: "32.1K", span: "2x1" as const, trend: { value: 8.1, label: "MoM" } },
      { id: "3", label: "Churn Rate", value: "1.8%", span: "1x1" as const, trend: { value: -0.3, label: "MoM" } },
      { id: "4", label: "NPS Score", value: "72", span: "1x1" as const, trend: { value: 4, label: "this quarter" } },
    ],
  },
  {
    name: "Social Proof",
    accent: "#34d399",
    columns: 3 as const,
    items: [
      { id: "1", label: "Companies", value: "2,400+", span: "1x1" as const },
      { id: "2", label: "Deployments", value: "18M+", span: "1x1" as const, trend: { value: 34, label: "this year" } },
      { id: "3", label: "Avg Rating", value: "4.9", span: "1x1" as const, trend: { value: 0.1, label: "vs 4.8" } },
      { id: "4", label: "Support", value: "< 2hr", span: "1x1" as const },
    ],
  },
];

export function BentoHeroCustomizer() {
  const [variant, setVariant] = React.useState<BentoVariant>("default");
  const [presetIdx, setPresetIdx] = React.useState(0);
  const preset = PRESETS[presetIdx];

  return (
    <div className="flex h-full flex-col gap-6 p-6 lg:flex-row">
      {/* Preview */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
        <div className="lf-grid absolute inset-0 opacity-30" />
        <div className="relative flex h-full flex-col justify-center p-5">
          <AnimatedBentoGrid
            items={preset.items}
            variant={variant}
            columns={preset.columns}
            className="mx-auto w-full max-w-xl"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/80 p-4 lg:w-56">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Preset</p>
          <div className="flex flex-col gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setPresetIdx(i)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-xs font-medium transition",
                  presetIdx === i
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/5 bg-white/5 text-white/50 hover:border-white/10 hover:bg-white/8 hover:text-white/70",
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5" />

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Variant</p>
          <div className="flex flex-col gap-2">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariant(v.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-xs transition",
                  variant === v.id
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/5 bg-white/5 text-white/50 hover:border-white/10 hover:bg-white/8 hover:text-white/70",
                )}
              >
                <span className="block font-medium">{v.label}</span>
                <span className="block text-white/30">{v.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}