"use client";

import * as React from "react";
import {
  LayeredWaveBackground,
  type LayeredWaveDirection,
  type LayeredWaveSpeed,
} from "@/components/layered-wave-background";
import {
  HeroControlPanel,
  HeroCopy,
  PanelSegmented,
  PanelSlider,
  PanelSwitch,
  useIsDarkTheme,
} from "@/components/library/interactive-dots-hero-customizer";
import { cn } from "@/lib/utils";

type WaveSwatch = { colors: readonly string[]; background: string };

const PALETTES = [
  {
    name: "Graphite",
    light: { colors: ["#d2d2d7", "#e8e8ed", "#b8b8bd"], background: "#f5f5f7" },
    dark: { colors: ["#3a3a3c", "#636366", "#2c2c2e"], background: "#000000" },
  },
  {
    name: "Blue",
    light: { colors: ["#a8d1ff", "#d6e9ff", "#6cb4ff"], background: "#f5f5f7" },
    dark: { colors: ["#0071e3", "#2997ff", "#00346b"], background: "#000000" },
  },
  {
    name: "Sand",
    light: { colors: ["#eadbc8", "#f5ede2", "#d6c0a3"], background: "#f5f5f7" },
    dark: { colors: ["#5c4a36", "#8a6f50", "#2e251b"], background: "#000000" },
  },
] as const satisfies ReadonlyArray<{ name: string; light: WaveSwatch; dark: WaveSwatch }>;

type PaletteName = (typeof PALETTES)[number]["name"];

const PALETTE_OPTIONS = PALETTES.map((palette) => ({ value: palette.name, label: palette.name }));
const SPEED_OPTIONS = [
  { value: "slow", label: "Slow" },
  { value: "medium", label: "Medium" },
  { value: "fast", label: "Fast" },
] as const satisfies ReadonlyArray<{ value: LayeredWaveSpeed; label: string }>;
const DIRECTION_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
] as const satisfies ReadonlyArray<{ value: LayeredWaveDirection; label: string }>;

export function LayeredWaveHeroCustomizer() {
  const isDark = useIsDarkTheme();
  const [paletteName, setPaletteName] = React.useState<PaletteName>("Blue");
  const [speed, setSpeed] = React.useState<LayeredWaveSpeed>("slow");
  const [direction, setDirection] = React.useState<LayeredWaveDirection>("left");
  const [waveLayers, setWaveLayers] = React.useState(4);
  const [waveWidth, setWaveWidth] = React.useState(1.25);
  const [waveHeight, setWaveHeight] = React.useState(0.9);
  const [blurIntensity, setBlurIntensity] = React.useState(28);
  const [opacity, setOpacity] = React.useState(0.7);
  const [transparentBackground, setTransparentBackground] = React.useState(false);
  const palette = PALETTES.find((item) => item.name === paletteName) ?? PALETTES[0];
  const swatch = isDark ? palette.dark : palette.light;

  return (
    <div
      className={cn(
        "relative h-full min-h-[560px] w-full overflow-hidden",
        transparentBackground ? "bg-white dark:bg-[#1c1c1e]" : "bg-[#f5f5f7] dark:bg-black",
      )}
    >
      <LayeredWaveBackground
        gradientColors={[...swatch.colors]}
        backgroundColor={swatch.background}
        transparentBackground={transparentBackground}
        waveLayers={waveLayers}
        waveWidth={waveWidth}
        waveHeight={waveHeight}
        blurIntensity={blurIntensity}
        opacity={opacity}
        speed={speed}
        direction={direction}
        className="absolute inset-0 h-full min-h-0 rounded-none"
      >
        {/* Lifts the component's built-in bottom shade so light mode stays clean. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-40% to-white/30 dark:hidden"
        />
      </LayeredWaveBackground>

      <HeroCopy
        align="center"
        eyebrow="Halftone Conference · Lisbon · March 12–14"
        title="Three days on the craft of calm software."
        body="Talks, workshops and long lunches with the people who build the tools you open every day. 400 seats."
        primary="Get a ticket"
        secondary="See the programme"
      />

      <HeroControlPanel subtitle="Tune the wave system.">
        <PanelSegmented label="Color" options={PALETTE_OPTIONS} value={paletteName} onChange={setPaletteName} />
        <PanelSegmented label="Speed" options={SPEED_OPTIONS} value={speed} onChange={setSpeed} />
        <PanelSegmented label="Direction" options={DIRECTION_OPTIONS} value={direction} onChange={setDirection} />
        <PanelSwitch label="Transparent background" checked={transparentBackground} onChange={setTransparentBackground} />
        <PanelSlider label="Wave layers" value={waveLayers} min={1} max={8} step={1} onChange={setWaveLayers} />
        <PanelSlider label="Wave width" value={waveWidth} min={0.8} max={2.2} step={0.05} onChange={setWaveWidth} />
        <PanelSlider label="Wave height" value={waveHeight} min={0.5} max={1.6} step={0.05} onChange={setWaveHeight} />
        <PanelSlider label="Blur" value={blurIntensity} min={0} max={44} step={2} onChange={setBlurIntensity} />
        <PanelSlider label="Opacity" value={opacity} min={0.2} max={1} step={0.02} onChange={setOpacity} />
      </HeroControlPanel>
    </div>
  );
}
