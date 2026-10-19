"use client";

import * as React from "react";
import { InteractiveDots, type InteractiveDotsMode } from "@/components/interactive-dots";
import { cn } from "@/lib/utils";

const PRESETS = [
  {
    name: "Noir",
    dotColor: "rgba(148, 163, 184, 0.58)",
    activeDotColor: "rgba(125, 211, 252, 0.95)",
    lineColor: "rgba(125, 211, 252, 0.72)",
    backgroundColor: "#05070d",
    light: false,
  },
  {
    name: "Violet",
    dotColor: "rgba(196, 181, 253, 0.55)",
    activeDotColor: "rgba(244, 114, 182, 0.95)",
    lineColor: "rgba(168, 85, 247, 0.72)",
    backgroundColor: "#090612",
    light: false,
  },
  {
    name: "Ice",
    dotColor: "rgba(15, 23, 42, 0.25)",
    activeDotColor: "rgba(14, 165, 233, 0.85)",
    lineColor: "rgba(14, 165, 233, 0.45)",
    backgroundColor: "#f8fafc",
    light: true,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export function InteractiveDotsHeroCustomizer() {
  const [mode, setMode] = React.useState<InteractiveDotsMode>("lines");
  const [dotSize, setDotSize] = React.useState(2.4);
  const [dotSpacing, setDotSpacing] = React.useState(30);
  const [interactionRadius, setInteractionRadius] = React.useState(130);
  const [repulsionStrength, setRepulsionStrength] = React.useState(48);
  const [lineDistance, setLineDistance] = React.useState(72);
  const [lineOpacity, setLineOpacity] = React.useState(0.34);
  const [preset, setPreset] = React.useState<Preset>(PRESETS[0]);

  return (
    <div className="grid h-full min-h-full w-full overflow-hidden rounded-lg bg-background lg:grid-cols-[1fr_320px]">
      <div className="relative min-h-[560px] overflow-hidden lg:min-h-full" style={{ backgroundColor: preset.backgroundColor }}>
        <InteractiveDots
          mode={mode}
          dotSize={dotSize}
          dotSpacing={dotSpacing}
          dotColor={preset.dotColor}
          activeDotColor={preset.activeDotColor}
          lineColor={preset.lineColor}
          backgroundColor={preset.backgroundColor}
          interactionRadius={interactionRadius}
          repulsionStrength={repulsionStrength}
          lineDistance={lineDistance}
          lineOpacity={lineOpacity}
          showToggle={false}
          className="h-full min-h-full rounded-none border-0"
        />

        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            preset.light
              ? "bg-[radial-gradient(circle_at_50%_20%,transparent,rgba(248,250,252,0.7)_78%)]"
              : "bg-[radial-gradient(circle_at_50%_20%,transparent,rgba(0,0,0,0.48)_78%)]",
          )}
        />
        <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14", preset.light ? "text-zinc-950" : "text-white")}>
          <p
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium",
              preset.light ? "border-zinc-900/10 bg-white/70 text-zinc-600" : "border-white/15 bg-white/[0.06] text-white/70",
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            Fieldwork 2.0 is out
          </p>
          <h2 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            See where your users actually look.
          </h2>
          <p className={cn("mt-5 max-w-xl text-pretty text-base leading-7 sm:text-lg", preset.light ? "text-zinc-600" : "text-white/65")}>
            Fieldwork maps attention across every page, then tells you which part of the layout is doing the work.
          </p>
          <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-semibold",
                preset.light ? "bg-zinc-950 text-white" : "bg-white text-zinc-950",
              )}
            >
              Start free trial
            </button>
            <button
              type="button"
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-semibold backdrop-blur-md",
                preset.light ? "border-zinc-900/15 bg-white/60 text-zinc-900" : "border-white/15 bg-white/[0.08] text-white",
              )}
            >
              Watch the 2-minute demo
            </button>
          </div>
        </div>
      </div>

      <aside className="border-t border-border bg-background p-5 dark:border-white/10 dark:bg-zinc-950 lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Customize</h3>
            <p className="mt-1 text-xs text-muted-foreground">Tune the hero background live.</p>
          </div>
          <button
            type="button"
            onClick={() => setMode((value) => (value === "dots" ? "lines" : "dots"))}
            className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {mode === "dots" ? "Dots" : "Lines"}
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-[12px] font-medium text-muted-foreground">
              Preset
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setPreset(item)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    preset.name === item.name
                      ? "border-foreground/25 bg-foreground text-background"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <Control label="Dot size" value={dotSize} min={1} max={6} step={0.2} onChange={setDotSize} />
          <Control label="Dot spacing" value={dotSpacing} min={18} max={54} step={2} onChange={setDotSpacing} />
          <Control label="Interaction radius" value={interactionRadius} min={70} max={220} step={5} onChange={setInteractionRadius} />
          <Control label="Repulsion strength" value={repulsionStrength} min={16} max={90} step={2} onChange={setRepulsionStrength} />
          <Control label="Line distance" value={lineDistance} min={36} max={120} step={2} onChange={setLineDistance} disabled={mode === "dots"} />
          <Control label="Line opacity" value={lineOpacity} min={0.08} max={0.8} step={0.02} onChange={setLineOpacity} disabled={mode === "dots"} />
        </div>
      </aside>
    </div>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn("block space-y-2", disabled && "opacity-45")}>
      <span className="flex items-center justify-between gap-4 text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{Number(value.toFixed(2))}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground disabled:cursor-not-allowed"
      />
    </label>
  );
}
