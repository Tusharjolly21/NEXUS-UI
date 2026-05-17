"use client";

import * as React from "react";
import {
  LayeredWaveBackground,
  type LayeredWaveDirection,
  type LayeredWaveSpeed,
} from "@/components/layered-wave-background";
import { cn } from "@/lib/utils";

const PALETTES = [
  {
    name: "Aurora",
    colors: ["#7c3aed", "#06b6d4", "#ec4899"],
    background: "#020617",
  },
  {
    name: "Sunset",
    colors: ["#f97316", "#ec4899", "#8b5cf6"],
    background: "#120713",
  },
  {
    name: "Ocean",
    colors: ["#0ea5e9", "#22c55e", "#67e8f9"],
    background: "#031018",
  },
] as const;

type Palette = (typeof PALETTES)[number];

export function LayeredWaveHeroCustomizer() {
  const [palette, setPalette] = React.useState<Palette>(PALETTES[0]);
  const [speed, setSpeed] = React.useState<LayeredWaveSpeed>("medium");
  const [direction, setDirection] = React.useState<LayeredWaveDirection>("left");
  const [waveLayers, setWaveLayers] = React.useState(5);
  const [waveWidth, setWaveWidth] = React.useState(1.25);
  const [waveHeight, setWaveHeight] = React.useState(1.08);
  const [blurIntensity, setBlurIntensity] = React.useState(24);
  const [opacity, setOpacity] = React.useState(0.72);
  const [transparentBackground, setTransparentBackground] = React.useState(false);

  return (
    <div className="grid h-full min-h-full w-full overflow-hidden rounded-lg bg-background lg:grid-cols-[1fr_320px]">
      <LayeredWaveBackground
        gradientColors={[...palette.colors]}
        backgroundColor={palette.background}
        transparentBackground={transparentBackground}
        waveLayers={waveLayers}
        waveWidth={waveWidth}
        waveHeight={waveHeight}
        blurIntensity={blurIntensity}
        opacity={opacity}
        speed={speed}
        direction={direction}
        className={cn(
          "h-full min-h-[560px] rounded-none lg:min-h-full",
          transparentBackground && "bg-[linear-gradient(135deg,#020617,#111827)]",
        )}
      >
        <div className="flex h-full items-center px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
              Layered wave background
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
              A calmer hero for launches that need atmosphere.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/66 sm:text-lg">
              Gradient wave layers drift at different speeds to create soft depth
              behind landing pages, SaaS heroes, portfolio intros, and event banners.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20">
                Join waitlist
              </button>
              <button className="rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md">
                View details
              </button>
            </div>
          </div>
        </div>
      </LayeredWaveBackground>

      <aside className="border-t border-border bg-background p-5 dark:border-white/10 dark:bg-zinc-950 lg:border-l lg:border-t-0">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Customize</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Tune the wave system for your hero.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Palette
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PALETTES.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setPalette(item)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition",
                    palette.name === item.name
                      ? "border-foreground/25 bg-foreground text-background"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Speed
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["slow", "medium", "fast"] as LayeredWaveSpeed[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSpeed(item)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium capitalize transition",
                    speed === item
                      ? "border-foreground/25 bg-foreground text-background"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDirection((value) => (value === "left" ? "right" : "left"))}
            className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            Direction: {direction}
          </button>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2">
            <span className="text-xs font-medium text-foreground">Transparent background</span>
            <input
              type="checkbox"
              checked={transparentBackground}
              onChange={(event) => setTransparentBackground(event.target.checked)}
              className="accent-foreground"
            />
          </label>

          <Control label="Wave layers" value={waveLayers} min={1} max={8} step={1} onChange={setWaveLayers} />
          <Control label="Wave width" value={waveWidth} min={0.8} max={2.2} step={0.05} onChange={setWaveWidth} />
          <Control label="Wave height" value={waveHeight} min={0.5} max={1.6} step={0.05} onChange={setWaveHeight} />
          <Control label="Blur" value={blurIntensity} min={0} max={44} step={2} onChange={setBlurIntensity} />
          <Control label="Opacity" value={opacity} min={0.2} max={1} step={0.02} onChange={setOpacity} />
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
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-2">
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
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
      />
    </label>
  );
}
