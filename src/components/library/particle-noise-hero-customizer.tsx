"use client";

import * as React from "react";
import { ParticleNoise, type ParticleNoiseSpeed } from "@/components/particle-noise";
import {
  HeroControlPanel,
  HeroCopy,
  PanelSegmented,
  PanelSlider,
  PanelSwitch,
  useIsDarkTheme,
} from "@/components/library/interactive-dots-hero-customizer";
import { cn } from "@/lib/utils";

type NoiseSwatch = { dotColor: string; secondaryDotColor: string };

const PALETTES = [
  {
    name: "Graphite",
    light: { dotColor: "#1d1d1f", secondaryDotColor: "#86868b" },
    dark: { dotColor: "#f5f5f7", secondaryDotColor: "#8e8e93" },
  },
  {
    name: "Silver",
    light: { dotColor: "#6e6e73", secondaryDotColor: "#c7c7cc" },
    dark: { dotColor: "#d1d1d6", secondaryDotColor: "#48484a" },
  },
  {
    name: "Blue",
    light: { dotColor: "#0071e3", secondaryDotColor: "#86868b" },
    dark: { dotColor: "#2997ff", secondaryDotColor: "#a1a1a6" },
  },
] as const satisfies ReadonlyArray<{ name: string; light: NoiseSwatch; dark: NoiseSwatch }>;

type PaletteName = (typeof PALETTES)[number]["name"];

const PALETTE_OPTIONS = PALETTES.map((palette) => ({ value: palette.name, label: palette.name }));
const SPEED_OPTIONS = [
  { value: "slow", label: "Slow" },
  { value: "medium", label: "Medium" },
  { value: "fast", label: "Fast" },
] as const;

export function ParticleNoiseHeroCustomizer() {
  const isDark = useIsDarkTheme();
  const [paletteName, setPaletteName] = React.useState<PaletteName>("Graphite");
  const [positionX, setPositionX] = React.useState(0);
  const [positionY, setPositionY] = React.useState(0.45);
  const [zoom, setZoom] = React.useState(0.9);
  const [spacing, setSpacing] = React.useState(18);
  const [inflation, setInflation] = React.useState(58);
  const [particleSize, setParticleSize] = React.useState(1.1);
  const [density, setDensity] = React.useState(0.95);
  const [speed, setSpeed] = React.useState<Extract<ParticleNoiseSpeed, string>>("slow");
  const [opacity, setOpacity] = React.useState(0.72);
  const [blur, setBlur] = React.useState(0);
  const [surfaceBias, setSurfaceBias] = React.useState(0.82);
  const [gridJitter, setGridJitter] = React.useState(0);
  const [animationEnabled, setAnimationEnabled] = React.useState(true);
  const [transparent, setTransparent] = React.useState(false);
  const palette = PALETTES.find((item) => item.name === paletteName) ?? PALETTES[0];
  const swatch = isDark ? palette.dark : palette.light;

  // On black the component blends additively for a soft glow. On a light
  // ground that would wash the dots out, so the canvas stays transparent and
  // the container paints the background instead.
  const canvasBackground = transparent || !isDark ? "transparent" : "#000000";

  return (
    <div
      className={cn(
        "relative h-full min-h-[560px] w-full overflow-hidden",
        transparent ? "bg-white dark:bg-[#1c1c1e]" : "bg-[#f5f5f7] dark:bg-black",
      )}
    >
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
        backgroundColor={canvasBackground}
        dotColor={swatch.dotColor}
        secondaryDotColor={swatch.secondaryDotColor}
        opacity={opacity}
        blur={blur}
        surfaceBias={surfaceBias}
        gridJitter={gridJitter}
        className="absolute inset-0 h-full min-h-0"
      />

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t to-transparent",
          transparent
            ? "from-white via-white/80 dark:from-[#1c1c1e] dark:via-[#1c1c1e]/75"
            : "from-[#f5f5f7] via-[#f5f5f7]/80 dark:from-black dark:via-black/75",
        )}
      />

      <HeroCopy
        eyebrow="Strata terrain API"
        title="Elevation data for every hillside on Earth."
        body="Ten-metre terrain tiles, refreshed monthly and served from the edge with a single request."
        primary="Get an API key"
        secondary="Browse the map"
      />

      <HeroControlPanel subtitle="Tune the noise field.">
        <PanelSegmented label="Color" options={PALETTE_OPTIONS} value={paletteName} onChange={setPaletteName} />
        <PanelSegmented label="Speed" options={SPEED_OPTIONS} value={speed} onChange={setSpeed} />
        <div className="space-y-3 rounded-[12px] bg-black/[0.035] p-3 dark:bg-white/[0.05]">
          <PanelSwitch label="Animation" checked={animationEnabled} onChange={setAnimationEnabled} />
          <PanelSwitch label="Transparent background" checked={transparent} onChange={setTransparent} />
        </div>
        <PanelSlider label="Position X" value={positionX} min={-2} max={2} step={0.05} onChange={setPositionX} />
        <PanelSlider label="Position Y" value={positionY} min={-2} max={2} step={0.05} onChange={setPositionY} />
        <PanelSlider label="Zoom" value={zoom} min={0.45} max={2.4} step={0.05} onChange={setZoom} />
        <PanelSlider label="Spacing" value={spacing} min={10} max={36} step={1} onChange={setSpacing} />
        <PanelSlider label="Inflation" value={inflation} min={4} max={86} step={2} onChange={setInflation} />
        <PanelSlider label="Particle size" value={particleSize} min={0.6} max={3.2} step={0.05} onChange={setParticleSize} />
        <PanelSlider label="Density" value={density} min={0.4} max={1.8} step={0.05} onChange={setDensity} />
        <PanelSlider label="Surface bias" value={surfaceBias} min={0} max={1} step={0.02} onChange={setSurfaceBias} />
        <PanelSlider label="Grid jitter" value={gridJitter} min={0} max={0.5} step={0.02} onChange={setGridJitter} />
        <PanelSlider label="Opacity" value={opacity} min={0.12} max={1} step={0.02} onChange={setOpacity} />
        <PanelSlider label="Blur" value={blur} min={0} max={3} step={0.25} onChange={setBlur} />
      </HeroControlPanel>
    </div>
  );
}
