"use client";

import * as React from "react";
import { ParticleNoise, type ParticleNoiseSpeed } from "@/components/particle-noise";
import { cn } from "@/lib/utils";

const PALETTES = [
  {
    name: "Mono",
    dotColor: "#f8fafc",
    secondaryDotColor: "#94a3b8",
    backgroundColor: "#000000",
  },
  {
    name: "Cyan",
    dotColor: "#7AE1FF",
    secondaryDotColor: "#bae6fd",
    backgroundColor: "#020617",
  },
  {
    name: "Warm",
    dotColor: "#fde68a",
    secondaryDotColor: "#fb7185",
    backgroundColor: "#100604",
  },
] as const;

type Palette = (typeof PALETTES)[number];

export function ParticleNoiseHeroCustomizer() {
  const [palette, setPalette] = React.useState<Palette>(PALETTES[0]);
  const [positionX, setPositionX] = React.useState(0);
  const [positionY, setPositionY] = React.useState(0.45);
  const [zoom, setZoom] = React.useState(0.9);
  const [spacing, setSpacing] = React.useState(18);
  const [inflation, setInflation] = React.useState(58);
  const [particleSize, setParticleSize] = React.useState(1.1);
  const [density, setDensity] = React.useState(0.95);
  const [speed, setSpeed] = React.useState<ParticleNoiseSpeed>("slow");
  const [opacity, setOpacity] = React.useState(0.86);
  const [blur, setBlur] = React.useState(0);
  const [surfaceBias, setSurfaceBias] = React.useState(0.82);
  const [gridJitter, setGridJitter] = React.useState(0);
  const [animationEnabled, setAnimationEnabled] = React.useState(true);
  const [transparent, setTransparent] = React.useState(false);

  return (
    <div className="grid h-full min-h-0 w-full overflow-hidden rounded-lg bg-background lg:grid-cols-[1fr_320px]">
      <div className="relative min-h-[560px] overflow-hidden bg-zinc-950 lg:min-h-full">
        <ParticleNoise
          positionX={positionX}
          positionY={positionY}
          zoom={zoom}
          spacing={spacing}
          inflation={inflation}
          particleSize={particleSize}
          density={density}
          animationEnabled={animationEnabled}
          speed={speed}
          backgroundColor={transparent ? "transparent" : palette.backgroundColor}
          dotColor={palette.dotColor}
          secondaryDotColor={palette.secondaryDotColor}
          opacity={opacity}
          blur={blur}
          surfaceBias={surfaceBias}
          gridJitter={gridJitter}
          className={cn(
            "absolute inset-0 h-full min-h-full",
            transparent && "bg-[radial-gradient(circle_at_50%_0%,#111827,#020617)]",
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_32%,transparent,rgba(0,0,0,0.28)_55%,rgba(0,0,0,0.72)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
          <p className="text-[14px] font-medium text-white/65">Strata terrain API</p>
          <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
            Elevation data for every hillside on Earth.
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-white/70 sm:text-lg">
            Ten-metre terrain tiles, refreshed monthly and served from the edge with a single request.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20">
              Get an API key
            </button>
            <button type="button" className="rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md">
              Browse the map
            </button>
          </div>
        </div>
      </div>

      <aside className="min-h-0 overflow-y-auto border-t border-border bg-background p-5 dark:border-white/10 dark:bg-zinc-950 lg:h-full lg:border-l lg:border-t-0">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Customize</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Tune the noise field live.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-[12px] font-medium text-muted-foreground">
              Palette
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PALETTES.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setPalette(item)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
            <p className="mb-2 text-[12px] font-medium text-muted-foreground">
              Speed
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["slow", "medium", "fast"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSpeed(item)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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

          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2">
            <span className="text-xs font-medium text-foreground">Animation</span>
            <input
              type="checkbox"
              checked={animationEnabled}
              onChange={(event) => setAnimationEnabled(event.target.checked)}
              className="accent-foreground"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2">
            <span className="text-xs font-medium text-foreground">Transparent</span>
            <input
              type="checkbox"
              checked={transparent}
              onChange={(event) => setTransparent(event.target.checked)}
              className="accent-foreground"
            />
          </label>

          <Control label="Position X" value={positionX} min={-2} max={2} step={0.05} onChange={setPositionX} />
          <Control label="Position Y" value={positionY} min={-2} max={2} step={0.05} onChange={setPositionY} />
          <Control label="Zoom" value={zoom} min={0.45} max={2.4} step={0.05} onChange={setZoom} />
          <Control label="Spacing" value={spacing} min={10} max={36} step={1} onChange={setSpacing} />
          <Control label="Inflation" value={inflation} min={4} max={86} step={2} onChange={setInflation} />
          <Control label="Particle size" value={particleSize} min={0.6} max={3.2} step={0.05} onChange={setParticleSize} />
          <Control label="Density" value={density} min={0.4} max={1.8} step={0.05} onChange={setDensity} />
          <Control label="Surface bias" value={surfaceBias} min={0} max={1} step={0.02} onChange={setSurfaceBias} />
          <Control label="Grid jitter" value={gridJitter} min={0} max={0.5} step={0.02} onChange={setGridJitter} />
          <Control label="Opacity" value={opacity} min={0.12} max={1} step={0.02} onChange={setOpacity} />
          <Control label="Blur" value={blur} min={0} max={3} step={0.25} onChange={setBlur} />
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
