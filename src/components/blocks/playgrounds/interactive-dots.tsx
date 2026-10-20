"use client";

import { InteractiveDots, type InteractiveDotsProps } from "@/components/interactive-dots";
import { LayeredWaveBackground, type LayeredWaveBackgroundProps } from "@/components/layered-wave-background";
import { ParticleNoise, type ParticleNoiseProps } from "@/components/particle-noise";
import { WavyLines, type WavyLinesProps } from "@/components/wavy-lines";
import { HalftonePlanet, type HalftonePlanetProps } from "@/components/blocks/motion-kit/halftone-planet";
import type { BlockPlaygrounds } from "./types";

/*
 * Stages: each background fills a 560px frame the way it sits behind a hero on the block page.
 * They only add the frame (and remount where a prop sets the starting state); every editable
 * value goes straight through to the real component.
 */

/** `mode` only sets the starting style, so a new value remounts the canvas. */
function InteractiveDotsStage({ mode = "lines", ...props }: InteractiveDotsProps) {
  return (
    <div className="relative h-[560px] w-full overflow-hidden">
      <InteractiveDots
        key={mode}
        mode={mode}
        {...props}
        className="absolute inset-0 h-full min-h-0 rounded-none border-0"
      />
    </div>
  );
}

function LayeredWaveStage(props: LayeredWaveBackgroundProps) {
  return (
    <div className="relative h-[560px] w-full overflow-hidden bg-background">
      <LayeredWaveBackground {...props} className="absolute inset-0 h-full min-h-0" />
    </div>
  );
}

function ParticleNoiseStage(props: ParticleNoiseProps) {
  return (
    <div className="relative h-[560px] w-full overflow-hidden bg-black">
      <ParticleNoise {...props} className="absolute inset-0 h-full min-h-0" />
    </div>
  );
}

/** Same composition as the page: the shader canvas, a soft vignette and a caption in the corner. */
function AuroraWavyLinesStage(props: WavyLinesProps) {
  return (
    <div className="relative h-[560px] w-full overflow-hidden bg-[#050b18]">
      <WavyLines {...props} className="h-full min-h-0 w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,transparent_0%,rgba(0,0,0,.2)_46%,rgba(0,0,0,.7)_100%)]" />
      <div className="pointer-events-none absolute bottom-10 left-10 max-w-md pr-6">
        <p className="text-[14px] font-medium text-[#a1a1a6]">Tidal, ocean sensor network</p>
        <p className="mt-3 text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-[#f5f5f7]">
          Readings from 4,000 buoys, live.
        </p>
        <p className="mt-3 text-pretty text-[16px] leading-[1.5] text-[#a1a1a6]">
          Swell, temperature and salinity, streamed every ninety seconds.
        </p>
      </div>
    </div>
  );
}

/** An empty `accentDark` field means "not set", so the planet derives its dark accent as it does by default. */
function HalftonePlanetStage({ accentDark, ...props }: HalftonePlanetProps) {
  return <HalftonePlanet {...props} accentDark={accentDark?.trim() ? accentDark : undefined} />;
}

const playgrounds: BlockPlaygrounds = {
  "backgrounds-interactive-dots": {
    Component: InteractiveDotsStage,
    jsxName: "InteractiveDots",
    importLine: `import { InteractiveDots } from "@/components/interactive-dots";`,
    props: [
      { name: "mode", type: `"dots" | "lines"`, description: "Starting style: plain dots, or dots joined by short lines to their neighbours.", defaultValue: `"lines"` },
      { name: "backgroundColor", type: "string", description: "Canvas fill behind the grid.", defaultValue: `"#05070d"` },
      { name: "dotSize", type: "number", description: "Resting dot radius in pixels.", defaultValue: "2.4", min: 1, max: 6, step: 0.2 },
      { name: "dotSpacing", type: "number", description: "Distance between grid points in pixels.", defaultValue: "30", min: 22, max: 54, step: 2 },
      { name: "interactionRadius", type: "number", description: "How far from the pointer dots get pushed, in pixels.", defaultValue: "120", min: 70, max: 220, step: 5 },
      { name: "repulsionStrength", type: "number", description: "How far a dot right under the pointer is pushed away.", defaultValue: "44", min: 16, max: 90, step: 2 },
      { name: "lineDistance", type: "number", description: "Dots closer than this are joined by a line (lines mode).", defaultValue: "68", min: 36, max: 120, step: 2 },
      { name: "lineOpacity", type: "number", description: "Opacity of the shortest lines; longer ones fade out.", defaultValue: "0.36", min: 0.08, max: 0.8, step: 0.02 },
      { name: "showToggle", type: "boolean", description: "Shows the pill in the corner that switches between dots and lines.", defaultValue: "true" },
      { name: "dotColor", type: "string", description: "Colour of dots at rest.", defaultValue: `"rgba(148, 163, 184, 0.62)"` },
      { name: "activeDotColor", type: "string", description: "Colour and glow of dots the pointer has moved; also the far end of each line gradient.", defaultValue: `"rgba(125, 211, 252, 0.95)"` },
      { name: "lineColor", type: "string", description: "Near end of each line gradient.", defaultValue: `"rgba(125, 211, 252, 0.72)"` },
      { name: "lineWidth", type: "number", description: "Line thickness; below 1 the lines are drawn dashed.", defaultValue: "0.8" },
      { name: "smoothing", type: "number", description: "Spring pull of each dot toward its target per frame.", defaultValue: "0.12" },
      { name: "damping", type: "number", description: "Velocity kept per frame (0 to 1); lower settles faster.", defaultValue: "0.82" },
      { name: "className", type: "string", description: "Classes for the root; give it a height or place it absolutely behind your content." },
    ],
  },

  "backgrounds-layered-wave": {
    Component: LayeredWaveStage,
    jsxName: "LayeredWaveBackground",
    importLine: `import { LayeredWaveBackground } from "@/components/layered-wave-background";`,
    props: [
      { name: "speed", type: `"slow" | "medium" | "fast"`, description: "Drift speed: one loop takes 38s, 25s or 16s for the front layer.", defaultValue: `"medium"` },
      { name: "direction", type: `"left" | "right"`, description: "Which way the waves drift.", defaultValue: `"left"` },
      { name: "waveLayers", type: "number", description: "How many stacked wave layers to draw.", defaultValue: "4", min: 1, max: 8, step: 1 },
      { name: "backgroundColor", type: "string", description: "Fill behind the waves.", defaultValue: `"#020617"` },
      { name: "opacity", type: "number", description: "Opacity of the front layer; each layer behind is 0.08 fainter.", defaultValue: "0.72", min: 0.2, max: 1, step: 0.02 },
      { name: "blurIntensity", type: "number", description: "Blur of the front layer in pixels; each layer behind is 4px sharper.", defaultValue: "24", min: 0, max: 44, step: 2 },
      { name: "waveWidth", type: "number", description: "Horizontal stretch of each wave (0.8 to 2.4).", defaultValue: "1.2", min: 0.8, max: 2.4, step: 0.05 },
      { name: "transparentBackground", type: "boolean", description: "Drops the fill and the top glow so the waves sit on your own background.", defaultValue: "false" },
      { name: "waveHeight", type: "number", description: "Vertical size of each wave (0.5 to 1.8).", defaultValue: "1" },
      { name: "gradientColors", type: "string[]", description: "Colours cycled through the layer gradients.", defaultValue: `["#7c3aed", "#06b6d4", "#ec4899"]` },
      { name: "children", type: "ReactNode", description: "Content rendered above the waves." },
      { name: "className", type: "string", description: "Classes for the root." },
    ],
  },

  "backgrounds-particle-noise": {
    Component: ParticleNoiseStage,
    jsxName: "ParticleNoise",
    importLine: `import { ParticleNoise } from "@/components/particle-noise";`,
    props: [
      { name: "speed", type: `"slow" | "medium" | "fast" | number`, description: "How fast the noise field flows (a number sets the raw rate).", defaultValue: `"medium"` },
      { name: "animationEnabled", type: "boolean", description: "Animates the field; off draws a single still frame.", defaultValue: "true" },
      { name: "dotColor", type: "string", description: "Main particle colour.", defaultValue: `"#7AE1FF"` },
      { name: "inflation", type: "number", description: "How far particles are pushed off their grid by the noise.", defaultValue: "32", min: 4, max: 86, step: 2 },
      { name: "particleSize", type: "number", description: "Base particle radius in pixels.", defaultValue: "1.35", min: 0.6, max: 3.2, step: 0.05 },
      { name: "spacing", type: "number", description: "Grid spacing between particles in pixels.", defaultValue: "18", min: 10, max: 36, step: 1 },
      { name: "zoom", type: "number", description: "Scale of the noise; higher gives broader, smoother swells.", defaultValue: "1", min: 0.45, max: 2.4, step: 0.05 },
      { name: "opacity", type: "number", description: "Overall particle opacity.", defaultValue: "0.72", min: 0.12, max: 1, step: 0.02 },
      { name: "density", type: "number", description: "Multiplies how many particles fit the grid (0.2 to 2.5).", defaultValue: "1" },
      { name: "surfaceBias", type: "number", description: "0 swirls particles freely, 1 lifts them into rolling ridges.", defaultValue: "0.72" },
      { name: "secondaryDotColor", type: "string", description: "Second colour mixed in by the noise; defaults to dotColor." },
      { name: "backgroundColor", type: "string", description: "Canvas fill. Any colour other than transparent blends the particles additively.", defaultValue: `"transparent"` },
      { name: "positionX", type: "number", description: "Pans the field horizontally.", defaultValue: "0" },
      { name: "positionY", type: "number", description: "Pans the field vertically.", defaultValue: "0" },
      { name: "gridJitter", type: "number", description: "Random offset of each particle's home point (0 to 1 of a cell).", defaultValue: "0" },
      { name: "blur", type: "number", description: "Canvas blur in pixels.", defaultValue: "0" },
      { name: "particleCount", type: "number", description: "Upper limit on particles.", defaultValue: "2600" },
      { name: "className", type: "string", description: "Classes for the root." },
    ],
  },

  "backgrounds-aurora-lines": {
    Component: AuroraWavyLinesStage,
    jsxName: "WavyLines",
    importLine: `import { WavyLines } from "@/components/wavy-lines";`,
    props: [
      { name: "lineColor", type: "string", description: "Colour of the glowing lines.", defaultValue: `"#22d3ee"` },
      { name: "backgroundColorStart", type: "string", description: "Left end of the background gradient.", defaultValue: `"#062525"` },
      { name: "backgroundColorEnd", type: "string", description: "Right end of the background gradient.", defaultValue: `"#0f3f2d"` },
      { name: "speed", type: "number", description: "Multiplier for how fast the lines flow.", defaultValue: "1.2", min: 0, max: 4, step: 0.1 },
      { name: "radius", type: "number", description: "Corner radius of the canvas in pixels.", defaultValue: "24", min: 0, max: 48, step: 2 },
      { name: "className", type: "string", description: "Classes for the canvas." },
      { name: "style", type: "CSSProperties", description: "Inline styles merged after the radius." },
    ],
  },

  "mk-halftone-planet": {
    Component: HalftonePlanetStage,
    jsxName: "HalftonePlanet",
    importLine: `import { HalftonePlanet } from "@/components/blocks/motion-kit/halftone-planet";`,
    props: [
      { name: "autoplay", type: "boolean", description: "Lets the bands of latitude drift so the planet reads as turning.", defaultValue: "true" },
      { name: "accent", type: "string", description: "Primary button, badge dot and focus ring colour.", defaultValue: `"#0071e3"` },
      { name: "ink", type: "string", description: "Dot colour in light mode.", defaultValue: `"#1d1d1f"` },
      { name: "inkDark", type: "string", description: "Dot colour in dark mode.", defaultValue: `"#f5f5f7"` },
      { name: "accentDark", type: "string", description: "Accent in dark mode. Leave empty: #0a84ff with the default accent, otherwise the accent itself." },
      { name: "onAction", type: `(label: "primary" | "secondary") => void`, description: "Called with which button was pressed. The buttons never navigate." },
      { name: "className", type: "string", description: "Classes for the section." },
    ],
  },
};

export default playgrounds;
